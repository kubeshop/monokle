import fs from 'fs';
import {uniq} from 'lodash';
import log from 'loglevel';
import path from 'path';
import {v4 as uuidv4} from 'uuid';
import {Document, LineCounter, ParsedNode, Scalar, YAMLSeq} from 'yaml';

import {
  CLUSTER_DIFF_PREFIX,
  KUSTOMIZATION_API_GROUP,
  KUSTOMIZATION_API_VERSION,
  KUSTOMIZATION_FILE_NAME,
  KUSTOMIZATION_KIND,
  PREVIEW_PREFIX,
  UNSAVED_PREFIX,
  YAML_DOCUMENT_DELIMITER,
} from '@constants/constants';

import {ClusterAccess} from '@models/appconfig';
import {FileMapType, ResourceMapType, ResourceRefsProcessingOptions} from '@models/appstate';
import {K8sResource, RefPosition, ResourceRefType} from '@models/k8sresource';

import {getAbsoluteResourcePath, getResourcesForPath} from '@redux/services/fileEntry';
import {isKustomizationPatch, isKustomizationResource, processKustomizations} from '@redux/services/kustomize';
import {clearRefNodesCache, isUnsatisfiedRef, refMapperMatchesKind} from '@redux/services/resourceRefs';

import {getFileTimestamp} from '@utils/files';
import {createKubeClient} from '@utils/kubeclient';
import {parseAllYamlDocuments, parseYamlDocument} from '@utils/yaml';

import {
  getDependentResourceKinds,
  getKnownResourceKinds,
  getResourceKindHandler,
  registerKindHandler,
} from '@src/kindhandlers';
import NamespaceHandler from '@src/kindhandlers/Namespace.handler';
import {extractKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';

import {processRefs} from './resourceRefs';
import {validateResource} from './validation';

/**
 * Parse documents lazily...
 */

export function doesTextStartWithYamlDocumentDelimiter(text: string) {
  return ['\n', '\r\n', '\r'].some(lineEnding => {
    return text.startsWith(`${YAML_DOCUMENT_DELIMITER}${lineEnding}`);
  });
}

type ParsedDocCacheEntry = {
  parsedDoc: Document.Parsed<ParsedNode>;
  lineCounter: LineCounter;
};

const parsedDocCache = new Map<string, ParsedDocCacheEntry>();

export function getParsedDoc(resource: K8sResource) {
  if (!parsedDocCache.has(resource.id)) {
    const lineCounter = new LineCounter();
    const parsedDoc = parseYamlDocument(resource.text, lineCounter);
    parsedDocCache.set(resource.id, {parsedDoc, lineCounter});
  }

  const cacheEntry = parsedDocCache.get(resource.id);
  return cacheEntry ? cacheEntry.parsedDoc : undefined;
}

export function getLineCounter(resource: K8sResource) {
  if (getParsedDoc(resource)) {
    const cacheEntry = parsedDocCache.get(resource.id);
    return cacheEntry ? cacheEntry.lineCounter : undefined;
  }
}

/**
 * Returns the Scalar at the specified path
 */

export function getScalarNode(resource: K8sResource, nodePath: string) {
  let parent: any = getParsedDoc(resource);

  const names = parseNodePath(nodePath);
  for (let ix = 0; ix < names.length; ix += 1) {
    const child = parent.get(names[ix], true);
    if (child) {
      // @ts-ignore
      parent = child;
    } else {
      log.warn(`${nodePath} not found in resource`);
      return undefined;
    }
  }

  if (parent instanceof Scalar) {
    return new NodeWrapper(parent, getLineCounter(resource));
  }

  log.warn(`node at ${nodePath} is not a Scalar`);
}

/**
 * Parses a nodePath into segments - simple split for now
 */

export function parseNodePath(nodePath: string) {
  return nodePath.split(':');
}

/**
 * Returns the Scalars at the specified path
 */

export function getScalarNodes(resource: K8sResource, nodePath: string) {
  let parents: any[] = [getParsedDoc(resource)];

  const names = parseNodePath(nodePath);
  for (let ix = 0; ix < names.length; ix += 1) {
    let nextParents: any[] = [];
    const name = names[ix];

    parents.forEach(parent => {
      const child = parent.get(name, true);
      if (child) {
        if (child instanceof YAMLSeq) {
          nextParents = nextParents.concat(child.items);
        } else {
          // @ts-ignore
          nextParents.push(child);
        }
      }
    });

    if (nextParents.length === 0) {
      return [];
    }

    parents = nextParents;
  }

  let results: NodeWrapper[] = [];
  parents.forEach(parent => {
    if (parent instanceof YAMLSeq) {
      results = results.concat(parent.items.map(node => new NodeWrapper(node, getLineCounter(resource))));
    } else if (parent instanceof Scalar) {
      results.push(new NodeWrapper(parent, getLineCounter(resource)));
    }
  });

  return results;
}

/**
 * Utility class used when parsing and creating refs
 */

export class NodeWrapper {
  node: Scalar;
  lineCounter?: LineCounter;

  constructor(node: Scalar, lineCounter?: LineCounter) {
    this.node = node;
    this.lineCounter = lineCounter;
  }

  nodeValue(): string {
    return this.node.value as string;
  }

  getNodePosition(): RefPosition {
    if (this.lineCounter && this.node.range) {
      const linePos = this.lineCounter.linePos(this.node.range[0]);
      return {
        line: linePos.line,
        column: linePos.col,
        length: this.node.range[1] - this.node.range[0],
      };
    }

    return {line: 0, column: 0, length: 0};
  }
}

/**
 * Utility function to get all resources of a specific kind
 */

export function getK8sResources(resourceMap: ResourceMapType, kind: string) {
  return Object.values(resourceMap).filter(item => item.kind === kind);
}

export function areRefPosEqual(a: RefPosition | undefined, b: RefPosition | undefined) {
  if (a === undefined && b === undefined) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.line === b.line && a.column === b.column && a.length === b.length;
}

/**
 * Adds a resource ref with the specified type/target to the specified resource
 */

export function createResourceRef(
  resource: K8sResource,
  refType: ResourceRefType,
  refNode?: NodeWrapper,
  targetResourceId?: string,
  targetResourceKind?: string,
  isOptional?: boolean
) {
  if (refNode || targetResourceId) {
    resource.refs = resource.refs || [];
    const refName = (refNode ? refNode.nodeValue() : targetResourceId) || '<missing>';

    // make sure we don't duplicate
    if (
      !resource.refs.some(
        ref =>
          ref.type === refType &&
          ref.name === refName &&
          ref.target?.type === 'resource' &&
          ref.target.resourceId === targetResourceId &&
          areRefPosEqual(ref.position, refNode?.getNodePosition())
      )
    ) {
      resource.refs.push({
        type: refType,
        name: refName,
        position: refNode?.getNodePosition(),
        target: {
          type: 'resource',
          resourceId: targetResourceId,
          resourceKind: targetResourceKind?.startsWith('$') ? undefined : targetResourceKind,
          isOptional,
        },
      });
    }
  } else {
    log.warn(`missing both refNode and targetResource for refType ${refType} on resource ${resource.filePath}`);
  }
}

/**
 * Creates bidirectional resourcerefs between two resources
 */

export function linkResources(
  source: K8sResource,
  target: K8sResource,
  sourceRef: NodeWrapper,
  targetRef?: NodeWrapper,
  isOptional?: boolean
) {
  createResourceRef(source, ResourceRefType.Outgoing, sourceRef, target.id, target.kind, isOptional);
  createResourceRef(target, ResourceRefType.Incoming, targetRef, source.id, source.kind, isOptional);
}

/**
 * Extracts all unique namespaces from resources in specified resourceMap
 */

export function getNamespaces(resourceMap: ResourceMapType) {
  const namespaces: string[] = [];
  Object.values(resourceMap).forEach(e => {
    if (e.filePath.startsWith(CLUSTER_DIFF_PREFIX)) {
      return;
    }
    if (e.namespace && !namespaces.includes(e.namespace)) {
      namespaces.push(e.namespace);
    }
  });
  return namespaces;
}

export async function getTargetClusterNamespaces(
  kubeconfigPath: string,
  context: string,
  clusterAccess?: ClusterAccess[]
): Promise<string[]> {
  const hasFullAccess = clusterAccess?.some(ca => ca.hasFullAccess);
  const clusterAccessNamespaces = clusterAccess?.map(ca => ca.namespace) || [];
  if (!hasFullAccess) {
    return clusterAccessNamespaces;
  }

  try {
    const kubeClient = createKubeClient(kubeconfigPath, context);
    const namespaces = await NamespaceHandler.listResourcesInCluster(kubeClient, {});

    const ns: string[] = [];
    namespaces.forEach(namespace => {
      const namespaceName = namespace.metadata?.name;

      if (namespaceName && !ns.includes(namespaceName)) {
        ns.push(namespaceName);
      }
    });

    ns.push(...clusterAccessNamespaces);
    return uniq(ns);
  } catch (e: any) {
    log.warn(`Failed to get namespaces in selected context. ${e.message}`);
    return [];
  }
}

/**
 * Creates a UI friendly resource name
 */

export function createResourceName(filePath: string, content: any, kind: string) {
  // for Kustomizations we return the name of the containing folder ('base', 'staging', etc)
  if (kind === KUSTOMIZATION_KIND && (!content?.apiVersion || content.apiVersion.startsWith(KUSTOMIZATION_API_GROUP))) {
    const ix = filePath.lastIndexOf(path.sep);
    if (ix > 0) {
      return filePath.substr(1, ix - 1);
    }
    return filePath;
  }

  // use metadata name if available
  if (content.metadata?.name) {
    // name could be an object if it's a helm template value...
    if (typeof content.metadata.name !== 'string') {
      return JSON.stringify(content.metadata.name).trim();
    }

    return content.metadata.name;
  }

  // use filename as last resort
  const ix = filePath.lastIndexOf(path.sep);
  if (ix > 0) {
    return filePath.substr(ix + 1);
  }

  return filePath;
}

/**
 * Adds a file ref to the specified file to the specified resource
 */

export function createFileRef(resource: K8sResource, refNode: NodeWrapper, filePath: string, fileMap: FileMapType) {
  let refType = fileMap[filePath] ? ResourceRefType.Outgoing : ResourceRefType.Unsatisfied;
  resource.refs = resource.refs || [];
  const refName = (refNode ? refNode.nodeValue() : filePath) || '<missing>';

  resource.refs.push({
    type: refType,
    name: refName,
    position: refNode?.getNodePosition(),
    target: {
      type: 'file',
      filePath,
    },
  });
}

/**
 * Checks if this specified resource is from a file (and not a virtual one)
 */

export function isFileResource(resource: K8sResource) {
  return !resource.filePath.startsWith(PREVIEW_PREFIX) && !isUnsavedResource(resource);
}

/**
 * Checks if this specified resource has been generated by a preview
 */

export function isPreviewResource(resource: K8sResource) {
  return resource.filePath.startsWith(PREVIEW_PREFIX);
}

/**
 * Checks if this specified resource is unsaved
 */

export function isUnsavedResource(resource: K8sResource) {
  return resource.filePath.startsWith(UNSAVED_PREFIX);
}

/**
 * Saves the specified value to the file of the specified resource - handles both
 * single and multi-resource files
 */

export function saveResource(resource: K8sResource, newValue: string, fileMap: FileMapType) {
  let valueToWrite = `${newValue.trim()}\n`;

  if (isFileResource(resource)) {
    const fileEntry = fileMap[resource.filePath];

    let absoluteResourcePath = getAbsoluteResourcePath(resource, fileMap);
    if (resource.range) {
      const content = fs.readFileSync(absoluteResourcePath, 'utf8');

      // need to make sure that document delimiter is still there if this resource was not first in the file
      if (resource.range.start > 0 && !doesTextStartWithYamlDocumentDelimiter(valueToWrite)) {
        valueToWrite = `${YAML_DOCUMENT_DELIMITER}\n${valueToWrite}`;
      }

      const newFileContent =
        content.substr(0, resource.range.start) +
        valueToWrite +
        content.substr(resource.range.start + resource.range.length);

      fs.writeFileSync(absoluteResourcePath, newFileContent);
    } else {
      // only document => just write to file
      fs.writeFileSync(absoluteResourcePath, newValue);
      valueToWrite = newValue;
    }

    fileEntry.timestamp = getFileTimestamp(absoluteResourcePath);
  }

  return valueToWrite;
}

/**
 * Reprocess kustomization-specific references for all kustomizations
 */

export function reprocessKustomizations(resourceMap: ResourceMapType, fileMap: FileMapType) {
  Object.values(resourceMap)
    .filter(r => isKustomizationResource(r))
    .forEach(r => {
      r.refs = [];
    });

  processKustomizations(resourceMap, fileMap);
}

/**
 * Reprocesses the specified resourceIds in regard to refs/etc (called after updating...)
 *
 * This could be more intelligent - it updates everything brute force for now...
 */

export function reprocessResources(
  schemaVersion: string,
  userDataDir: string,
  resourceIds: string[],
  resourceMap: ResourceMapType,
  fileMap: FileMapType,
  processingOptions: ResourceRefsProcessingOptions,
  options?: {
    resourceKinds?: string[];
  }
) {
  if (resourceIds.length === 0) {
    return;
  }

  let resourceKinds = resourceIds
    .map(resId => resourceMap[resId])
    .filter(res => res !== undefined)
    .map(res => res.kind);

  if (options && options.resourceKinds) {
    resourceKinds = [...resourceKinds, ...options.resourceKinds];
  }
  const dependentResourceKinds = getDependentResourceKinds(resourceKinds);
  let resourceKindsToReprocess = [...resourceKinds, ...dependentResourceKinds];
  resourceKindsToReprocess = [...new Set(resourceKindsToReprocess)];

  resourceIds.forEach(id => {
    const resource = resourceMap[id];
    if (resource) {
      const isPatch = isKustomizationPatch(resource);
      resource.name = createResourceName(resource.filePath, resource.content, resource.kind);
      if (isPatch) {
        resource.name = `Patch: ${resource.name}`;
      }

      const isKustomziationFile = resource.filePath.toLowerCase().endsWith(KUSTOMIZATION_FILE_NAME);
      const kindHandler = resource.content.kind ? getResourceKindHandler(resource.content.kind) : undefined;

      resource.kind = resource.content.kind || (isKustomziationFile ? KUSTOMIZATION_KIND : 'Unknown');
      resource.version =
        resource.content.apiVersion ||
        (isKustomziationFile ? KUSTOMIZATION_API_VERSION : kindHandler ? kindHandler.clusterApiVersion : 'Unknown');

      resource.namespace = extractNamespace(resource.content);

      // clear caches
      parsedDocCache.delete(resource.id);
      clearRefNodesCache(resource.id);
    }
  });

  processResources(schemaVersion, userDataDir, resourceMap, processingOptions, {
    resourceIds,
    resourceKinds: resourceKindsToReprocess,
  });

  // always reprocess kustomizations - kustomization refs to updated resources may need to be recreated
  reprocessKustomizations(resourceMap, fileMap);
}

/**
 * Establishes refs for all resources in specified resourceMap
 */

export function processResources(
  schemaVersion: string,
  userHomeDir: string,
  resourceMap: ResourceMapType,
  processingOptions: ResourceRefsProcessingOptions,
  options?: {
    resourceIds?: string[];
    resourceKinds?: string[];
    skipValidation?: boolean;
  }
) {
  if (!options?.skipValidation) {
    if (options && options.resourceIds && options.resourceIds.length > 0) {
      const [currentId, ...relatedIds] = options.resourceIds;
      validateResource(resourceMap[currentId], schemaVersion, userHomeDir);

      Object.values(resourceMap)
        .filter(r => relatedIds?.includes(r.id))
        .forEach(resource => {
          validateResource(resource, schemaVersion, userHomeDir, {skipPolicies: true});
        });
    }

    if (options && options.resourceKinds && options.resourceKinds.length > 0) {
      Object.values(resourceMap)
        .filter(r => options.resourceKinds?.includes(r.kind))
        .forEach(resource => {
          if (!options.resourceIds || !options.resourceIds.includes(resource.id)) {
            validateResource(resource, schemaVersion, userHomeDir, {skipPolicies: true});
          }
        });
    }

    if (!options || (!options.resourceIds && !options.resourceKinds)) {
      Object.values(resourceMap).forEach(resource => {
        validateResource(resource, schemaVersion, userHomeDir);
      });
    }
  }
  const timestamp = Date.now();
  processRefs(resourceMap, processingOptions, options);
  log.info(`processing refs took ${Date.now() - timestamp}`, options);
}

/**
 * udpates resource ranges for all resources in the same file as the specified
 * resource
 */

export function recalculateResourceRanges(resource: K8sResource, fileMap: FileMapType, resourceMap: ResourceMapType) {
  // if length of value has changed we need to recalculate document ranges for
  // subsequent resource so future saves will be at correct place in document
  if (resource.range && resource.range.length !== resource.text.length) {
    const fileEntry = fileMap[resource.filePath];
    if (fileEntry) {
      // get list of resourceIds in file sorted by startPosition
      const resourceIds = getResourcesForPath(resource.filePath, resourceMap)
        .sort((a, b) => {
          return a.range && b.range ? a.range.start - b.range.start : 0;
        })
        .map(r => r.id);

      let resourceIndex = resourceIds.indexOf(resource.id);
      if (resourceIndex !== -1) {
        const diff = resource.text.length - resource.range.length;
        resource.range.length = resource.text.length;

        while (resourceIndex < resourceIds.length - 1) {
          resourceIndex += 1;
          let rid = resourceIds[resourceIndex];
          const r = resourceMap[rid];
          if (r && r.range) {
            r.range.start += diff;
          } else {
            throw new Error(`Failed to find resource ${rid} in fileEntry resourceIds for ${fileEntry.name}`);
          }
        }
      } else {
        throw new Error(`Failed to find resource in list of ids of fileEntry for ${fileEntry.name}`);
      }
    } else {
      throw new Error(`Failed to find fileEntry for resource with path ${resource.filePath}`);
    }
  }
}

export function removeResourceFromFile(
  removedResource: K8sResource,
  fileMap: FileMapType,
  resourceMap: ResourceMapType
) {
  const fileEntry = fileMap[removedResource.filePath];
  if (!fileEntry) {
    throw new Error(`Failed to find fileEntry for resource with path ${removedResource.filePath}`);
  }
  const absoluteFilePath = getAbsoluteResourcePath(removedResource, fileMap);

  if (!fs.existsSync(absoluteFilePath)) {
    log.error(`[removeResourceFromFile] - ${absoluteFilePath} doesn't exist`);
    return;
  }

  // get list of resourceIds in file sorted by startPosition
  const resourceIds = getResourcesForPath(removedResource.filePath, resourceMap)
    .sort((a, b) => {
      return a.range && b.range ? a.range.start - b.range.start : 0;
    })
    .map(r => r.id);

  // delete the file if there's only one resource in it
  if (!removedResource.range || resourceIds.length === 1) {
    fs.unlinkSync(absoluteFilePath);
    return;
  }

  // recalculate ranges for resources below the removed resource
  let newRangeStart = 0;
  let passedRemovedResource = false;
  resourceIds.forEach(resourceId => {
    const resource = resourceMap[resourceId];
    if (resourceId === removedResource.id) {
      passedRemovedResource = true;
      newRangeStart = resource.range?.start || newRangeStart;
      return;
    }
    if (!passedRemovedResource) {
      return;
    }
    if (resource.range) {
      resource.range.start = newRangeStart;
      newRangeStart = resource.range.start + resource.range.length;
    }
  });

  const content = fs.readFileSync(absoluteFilePath, 'utf8');
  fs.writeFileSync(
    absoluteFilePath,
    content.substr(0, removedResource.range.start) +
      content.substr(removedResource.range.start + removedResource.range.length)
  );
  fileEntry.timestamp = getFileTimestamp(absoluteFilePath);
  deleteResource(removedResource, resourceMap);
}

/**
 * Extracts the namespace from the specified resource content
 */

function extractNamespace(content: any) {
  // namespace could be an object if it's a helm template value...
  return content.metadata?.namespace && typeof content.metadata.namespace === 'string'
    ? content.metadata.namespace
    : undefined;
}

/**
 * Extracts all resources from the specified text content (must be yaml)
 */

export function extractK8sResources(fileContent: string, relativePath: string) {
  const lineCounter: LineCounter = new LineCounter();
  const documents = parseAllYamlDocuments(fileContent, lineCounter);
  const result: K8sResource[] = [];
  let splitDocs: any;

  if (documents) {
    let docIndex = 0;
    documents.forEach(doc => {
      if (doc.errors.length > 0) {
        if (!splitDocs) {
          splitDocs = fileContent.split('---');
        }

        log.warn(
          `Ignoring document ${docIndex} in ${path.parse(relativePath).name} due to ${doc.errors.length} error(s)`,
          documents[docIndex],
          splitDocs && docIndex < splitDocs.length ? splitDocs[docIndex] : ''
        );
      } else {
        if (doc.warnings.length > 0) {
          log.warn('[extractK8sResources]: Doc has warnings', doc);
        }

        const content = doc.toJS();
        if (content && content.apiVersion && content.kind) {
          const text = fileContent.slice(doc.range[0], doc.range[1]);

          let resource: K8sResource = {
            name: createResourceName(relativePath, content, content.kind),
            filePath: relativePath,
            id: (content.metadata && content.metadata.uid) || uuidv4(),
            isHighlighted: false,
            isSelected: false,
            kind: content.kind,
            version: content.apiVersion,
            content,
            text,
          };

          if (
            resource.kind === 'CustomResourceDefinition' &&
            resource.content?.spec?.names?.kind &&
            !getResourceKindHandler(resource.content.spec.names.kind)
          ) {
            try {
              const kindHandler = extractKindHandler(resource.content);
              if (kindHandler) {
                registerKindHandler(kindHandler, false);
              } else {
                log.warn('Failed to extract kindHandler', resource.content);
              }
            } catch (e) {
              log.warn('Failed to register custom kindhandler', resource, e);
            }
          }

          // if this is a single-resource file we can save the parsedDoc and lineCounter
          if (documents.length === 1) {
            parsedDocCache.set(resource.id, {parsedDoc: doc, lineCounter});
          } else {
            // for multi-resource files we just save the range - the parsedDoc and lineCounter will
            // be created on demand (since they are incorrect in this context)
            resource.range = {start: doc.range[0], length: doc.range[1] - doc.range[0]};
          }

          // set the namespace if available
          resource.namespace = extractNamespace(content);

          result.push(resource);
        }
        // handle special case of untyped kustomization.yaml files
        else if (content && relativePath.toLowerCase().endsWith(KUSTOMIZATION_FILE_NAME) && documents.length === 1) {
          let resource: K8sResource = {
            name: createResourceName(relativePath, content, KUSTOMIZATION_KIND),
            filePath: relativePath,
            id: uuidv4(),
            isHighlighted: false,
            isSelected: false,
            kind: KUSTOMIZATION_KIND,
            version: KUSTOMIZATION_API_VERSION,
            content,
            text: fileContent,
          };

          // if this is a single-resource file we can save the parsedDoc and lineCounter
          parsedDocCache.set(resource.id, {parsedDoc: doc, lineCounter});
          result.push(resource);
        }
      }
      docIndex += 1;
    });
  }
  return result;
}

/**
 * Deletes the specified resource from internal caches and the specified resourceMap
 */

export function deleteResource(resource: K8sResource, resourceMap: ResourceMapType) {
  parsedDocCache.delete(resource.id);
  clearRefNodesCache(resource.id);
  delete resourceMap[resource.id];
}

/**
 * Gets all resources linked to the specified resource
 */

export function getLinkedResources(resource: K8sResource) {
  const linkedResourceIds: string[] = [];
  resource.refs
    ?.filter(ref => !isUnsatisfiedRef(ref.type))
    .forEach(ref => {
      if (ref.target?.type === 'resource' && ref.target.resourceId) {
        linkedResourceIds.push(ref.target.resourceId);
      }
    });

  return linkedResourceIds;
}

/**
 * Returns all resource kinds that could potentially link to the specified resource
 */

const targetResourceKindCache = new Map<string, string[]>();

export function getResourceKindsWithTargetingRefs(resource: K8sResource) {
  if (!targetResourceKindCache.has(resource.kind)) {
    const resourceKinds = getKnownResourceKinds().filter(kind => {
      const handler = getResourceKindHandler(kind);
      if (handler && handler.outgoingRefMappers) {
        return handler.outgoingRefMappers.some(mapper => refMapperMatchesKind(mapper, resource.kind));
      }
      return false;
    });

    targetResourceKindCache.set(resource.kind, resourceKinds);
  }
  return targetResourceKindCache.get(resource.kind);
}

/**
 * check if the k8sResource is supported - currently excludes any files
 * that seem to contain Helm template or Monokle Vanilla template content
 */

export function hasSupportedResourceContent(resource: K8sResource): boolean {
  const helmVariableRegex = /{{.*}}/g;
  const vanillaTemplateVariableRegex = /\[\[.*]]/g;
  return !resource.text.match(helmVariableRegex)?.length && !resource.text.match(vanillaTemplateVariableRegex)?.length;
}
