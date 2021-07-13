import path from 'path';
import {AppState, FileMapType, ResourceMapType} from '@models/appstate';
import {K8sResource, RefPosition, ResourceRefType} from '@models/k8sresource';
import fs from 'fs';
import {PREVIEW_PREFIX, YAML_DOCUMENT_DELIMITER} from '@src/constants';
import {isKustomizationResource, processKustomizations} from '@redux/utils/kustomize';
import {getAbsoluteResourcePath, getResourcesForPath} from '@redux/utils/fileEntry';
import {LineCounter, parseAllDocuments, parseDocument, Scalar, visit, YAMLSeq} from 'yaml';
import log from 'loglevel';
import {isUnsatisfiedRef} from '@redux/utils/resourceRefs';
import {v4 as uuidv4} from 'uuid';

export function processServices(resourceMap: ResourceMapType) {
  const deployments = getK8sResources(resourceMap, 'Deployment').filter(
    d => d.content.spec?.template?.metadata?.labels,
  );

  getK8sResources(resourceMap, 'Service').forEach(service => {
    if (service.content?.spec?.selector) {
      Object.keys(service.content.spec.selector).forEach((e: any) => {
        let found = false;
        deployments
          .filter(
            deployment => deployment.content.spec.template.metadata.labels[e] === service.content.spec.selector[e],
          )
          .forEach(deployment => {
            const sourceNode = getScalarNode(service, `spec:selector:${e}`);
            const targetNode = getScalarNode(deployment, `spec:template:metadata:labels:${e}`);
            if (sourceNode && targetNode) {
              linkResources(deployment, service, ResourceRefType.SelectedPodName, ResourceRefType.ServicePodSelector, targetNode, sourceNode);
            }
            found = true;
          });

        if (!found) {
          const sourceNode = getScalarNode(service, `spec:selector:${e}`);
          if (sourceNode) {
            createResourceRef(service, ResourceRefType.UnsatisfiedSelector, sourceNode);
          }
        }
      });
    }
  });
}

/**
 * Adds configmap resourcerefs for specified configMapName to deployment
 */

function linkConfigMapToDeployment(configMaps: K8sResource[], deployment: K8sResource, refNode: NodeWrapper) {
  let found = false;
  configMaps
    .filter(item => item.content.metadata.name === refNode.node.value)
    .forEach(configMapResource => {
      const targetNode = getScalarNode(configMapResource, 'metadata:name');
      if (targetNode) {
        linkResources(configMapResource, deployment,
          ResourceRefType.ConfigMapRef, ResourceRefType.ConfigMapConsumer, targetNode, refNode,
        );
      }
      found = true;
    });

  if (!found) {
    createResourceRef(deployment, ResourceRefType.UnsatisfiedConfigMap, refNode);
  }
}

/**
 * Returns the Scalar at the specified path
 */

export function getScalarNode(resource: K8sResource, nodePath: string) {
  if (resource.parsedDoc) {
    let parent: any = resource.parsedDoc;

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
      return new NodeWrapper(parent, resource.lineCounter);
    }

    log.warn(`node at ${nodePath} is not a Scalar`);
  }
}

/**
 * Parses a nodePath into segments - simple split for now
 */

export function parseNodePath(nodePath: string) {
  return nodePath.split(':');
}

/**
 * Returns the Scalar at the specified path
 */

export function getScalarNodes(resource: K8sResource, nodePath: string) {
  if (resource.parsedDoc) {
    let parent: any = resource.parsedDoc;

    const names = parseNodePath(nodePath);
    for (let ix = 0; ix < names.length; ix += 1) {
      const child = parent.get(names[ix], true);
      if (child) {
        // @ts-ignore
        parent = child;
      } else {
        log.warn(`${nodePath} not found in resource`);
        return [];
      }
    }

    if (parent instanceof YAMLSeq) {
      return parent.items.map(node => new NodeWrapper(node, resource.lineCounter));
    }

    log.warn(`node at ${nodePath} is not a YAMLSeq`);
  }
  return [];
}

/**
 * Processes all configmaps in provided resourceMap and creates
 * applicable resourcerefs
 */

export function processConfigMaps(resourceMap: ResourceMapType) {
  const configMaps = getK8sResources(resourceMap, 'ConfigMap').filter(e => e.content?.metadata?.name);
  if (configMaps) {
    getK8sResources(resourceMap, 'Deployment').forEach(deployment => {
      if (deployment.parsedDoc) {
        visit(deployment.parsedDoc, {
          Pair(key, node) {
            // @ts-ignore
            const keyValue = node.key.value;
            if (keyValue === 'configMap' || keyValue === 'configMapRef' || keyValue === 'configMapKeyRef') {
              // @ts-ignore
              const nameNode: Scalar<string> = node.value.get('name', true);
              if (nameNode) {
                linkConfigMapToDeployment(configMaps, deployment, new NodeWrapper(nameNode, deployment.lineCounter));
              }
            }
          },
        });
      }
    });
  }
}

export class NodeWrapper {
  node: any;
  lineCounter?: LineCounter;

  constructor(node: any, lineCounter?: LineCounter) {
    this.node = node;
    this.lineCounter = lineCounter;
  }

  nodeValue(): string {
    return this.node.value;
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

export function getK8sResources(resourceMap: ResourceMapType, type: string) {
  return Object.values(resourceMap).filter(item => item.kind === type);
}

/**
 * Adds a resource ref with the specified type/target to the specified resource
 */
function createResourceRef(resource: K8sResource, refType: ResourceRefType, refNode?: NodeWrapper, targetResource?: string) {
  if (refNode || targetResource) {
    resource.refs = resource.refs || [];
    const refName = (refNode ? refNode.nodeValue() : targetResource) || '<missing>';

    // make sure we don't duplicate
    if (!resource.refs.some(ref => ref.refType === refType && ref.refName === refName && ref.targetResource === targetResource)) {
      resource.refs.push(
        {
          refType,
          refName,
          refPos: refNode?.getNodePosition(),
          targetResource,
        },
      );
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
  sourceRefType: ResourceRefType,
  targetRefType: ResourceRefType,
  sourceRef: NodeWrapper,
  targetRef?: NodeWrapper,
) {
  createResourceRef(source, sourceRefType, sourceRef, target.id);
  createResourceRef(target, targetRefType, targetRef, source.id);
}

/**
 * Extracts all unique namespaces from resources in specified resourceMap
 */

export function getNamespaces(resourceMap: ResourceMapType) {
  const namespaces: string[] = [];
  Object.values(resourceMap).forEach(e => {
    if (e.namespace && !namespaces.includes(e.namespace)) {
      namespaces.push(e.namespace);
    }
  });
  return namespaces;
}

/**
 * Creates a UI friendly resource name
 */

export function createResourceName(filePath: string, content: any) {
  if (content.kind === 'Kustomization') {
    const ix = filePath.lastIndexOf(path.sep);
    if (ix > 0) {
      const ix2 = filePath.lastIndexOf(path.sep, ix - 1);
      if (ix2 > 0) {
        return filePath.substr(ix2 + 1, ix - ix2 - 1);
      }
      return filePath.substr(1, ix - 1);
    }
    return filePath;
  }

  let name = content.metadata?.name ? `${content.metadata.name} ` : '';
  return `${name + content.kind} [${content.apiVersion}]`;
}

/**
 * Checks if this specified resource is from a file (and not a virtual one)
 */

export function isFileResource(resource: K8sResource) {
  return !resource.filePath.startsWith(PREVIEW_PREFIX);
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
      if (resource.range.start > 0 && !valueToWrite.startsWith(YAML_DOCUMENT_DELIMITER)) {
        valueToWrite = `${YAML_DOCUMENT_DELIMITER}${valueToWrite}`;
      }

      fs.writeFileSync(
        absoluteResourcePath,
        content.substr(0, resource.range.start) +
        valueToWrite +
        content.substr(resource.range.start + resource.range.length),
      );
    } else {
      // only document => just write to file
      fs.writeFileSync(absoluteResourcePath, newValue);
    }

    fileEntry.timestamp = fs.statSync(absoluteResourcePath).mtime.getTime();
  }

  return valueToWrite;
}

/**
 * This needs to be called to remove temporary objects used during processing which are not serializable
 */

export function clearParsedDocs(resourceMap: ResourceMapType) {
  Object.values(resourceMap).forEach(r => {
    r.parsedDoc = undefined;
    r.lineCounter = undefined;
  });

  return resourceMap;
}

/**
 * Reprocesses the specified resourceIds in regard to refs/etc (called after updating...)
 *
 * This could be more intelligent - it updates everything brute force for now...
 */

export function reprocessResources(resourceIds: string[], resourceMap: ResourceMapType, fileMap: FileMapType) {
  resourceIds.forEach(id => {
    const resource = resourceMap[id];
    if (resource) {
      resource.name = createResourceName(resource.filePath, resource.content);
      resource.kind = resource.content.kind;
      resource.version = resource.content.apiVersion;
    }
  });

  let hasKustomizations = false;
  Object.values(resourceMap).forEach(resource => {
    resource.refs = undefined;
    if (isKustomizationResource(resource)) {
      hasKustomizations = true;
    }
    const lineCounter = new LineCounter();
    resource.parsedDoc = parseDocument(resource.text, {lineCounter});
    resource.lineCounter = lineCounter;
  });

  if (hasKustomizations) {
    processKustomizations(resourceMap, fileMap);
  }

  processParsedResources(resourceMap);
  clearParsedDocs(resourceMap);
}

/**
 * Establishes refs for all resources in specified resourceMap
 */

export function processParsedResources(resourceMap: ResourceMapType) {
  processServices(resourceMap);
  processConfigMaps(resourceMap);
}

/**
 * udpates resource ranges for all resources in the same file as the specified
 * resource
 */

export function recalculateResourceRanges(resource: K8sResource, state: AppState) {
  // if length of value has changed we need to recalculate document ranges for
  // subsequent resource so future saves will be at correct place in document
  if (resource.range && resource.range.length !== resource.text.length) {
    const fileEntry = state.fileMap[resource.filePath];
    if (fileEntry) {
      // get list of resourceIds in file sorted by startPosition
      const resourceIds = getResourcesForPath(resource.filePath, state.resourceMap)
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
          const r = state.resourceMap[rid];
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

/**
 * Extracts all resources from the specified text content (must be yaml)
 */

export function extractK8sResources(fileContent: string, relativePath: string) {
  const lineCounter: LineCounter = new LineCounter();
  const documents = parseAllDocuments(fileContent, {lineCounter});
  const result: K8sResource[] = [];

  if (documents) {
    let docIndex = 0;
    documents.forEach(doc => {
      if (doc.errors.length > 0) {
        log.warn(
          `Ignoring document ${docIndex} in ${path.parse(relativePath).name} due to ${doc.errors.length} error(s)`,
        );
        doc.errors.forEach(e => log.warn(e.message));
      } else {
        const content = doc.toJS();
        if (content && content.apiVersion && content.kind) {
          const text = fileContent.slice(doc.range[0], doc.range[1]);

          let resource: K8sResource = {
            name: createResourceName(relativePath, content),
            filePath: relativePath,
            id: uuidv4(),
            highlight: false,
            selected: false,
            kind: content.kind,
            version: content.apiVersion,
            content,
            text,
            parsedDoc: doc,
            lineCounter,
          };

          if (documents.length > 1) {
            resource.range = {start: doc.range[0], length: doc.range[1] - doc.range[0]};

            // need to reparse since offsets are to full document
            const lc = new LineCounter();
            resource.parsedDoc = parseDocument(resource.text, {lineCounter: lc});
            resource.lineCounter = lc;
          }

          if (content.metadata && content.metadata.namespace) {
            resource.namespace = content.metadata.namespace;
          }

          result.push(resource);
        }
      }
      docIndex += 1;
    });
  }
  return result;
}

/**
 * Gets all resources linked to the specified resource
 */

export function getLinkedResources(resource: K8sResource) {
  const linkedResourceIds: string[] = [];
  resource.refs
    ?.filter(ref => !isUnsatisfiedRef(ref.refType))
    .forEach(ref => {
      if (ref.targetResource) {
        linkedResourceIds.push(ref.targetResource);
      }
    });

  return linkedResourceIds;
}
