import fs from 'fs';
import {merge, uniq} from 'lodash';
import log from 'loglevel';
import path from 'path';
import {v4 as uuidv4} from 'uuid';
import {Document, LineCounter, ParsedNode} from 'yaml';

import {
  KUSTOMIZATION_API_GROUP,
  KUSTOMIZATION_API_VERSION,
  KUSTOMIZATION_KIND,
  YAML_DOCUMENT_DELIMITER,
} from '@constants/constants';

import {getAbsoluteResourcePath, getLocalResourceMetasForPath} from '@redux/services/fileEntry';

// import {VALIDATOR} from '@redux/validation/validation.services';
import {saveCRD} from '@utils/crds';
import {getFileTimestamp} from '@utils/files';
import {parseAllYamlDocuments, parseYamlDocument} from '@utils/yaml';

import {getResourceKindHandler, registerKindHandler} from '@src/kindhandlers';
import NamespaceHandler from '@src/kindhandlers/Namespace.handler';
import {extractKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';

import {FileMapType} from '@shared/models/appState';
import {ClusterAccess} from '@shared/models/config';
import {K8sObject} from '@shared/models/k8s';
import {
  K8sResource,
  ResourceContent,
  ResourceContentMap,
  ResourceIdentifier,
  ResourceMap,
  ResourceMeta,
  ResourceMetaMap,
  isLocalResource,
} from '@shared/models/k8sResource';
import {AnyOrigin, LocalOrigin, isLocalOrigin} from '@shared/models/origin';
import {AppSelection, isResourceSelection} from '@shared/models/selection';
import {createKubeClient} from '@shared/utils/kubeclient';

import {isKustomizationFilePath} from './kustomize';

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

export function getParsedDoc(resource: K8sResource, options?: {forceParse?: boolean}): Document.Parsed<ParsedNode> {
  const forceParse = options?.forceParse ?? false;

  if (forceParse || !parsedDocCache.has(resource.id)) {
    const lineCounter = new LineCounter();
    const parsedDoc = parseYamlDocument(resource.text, lineCounter);
    parsedDocCache.set(resource.id, {parsedDoc, lineCounter});
  }

  const cacheEntry = parsedDocCache.get(resource.id);
  return cacheEntry!.parsedDoc;
}

export function getLineCounter(resource: K8sResource) {
  if (getParsedDoc(resource)) {
    const cacheEntry = parsedDocCache.get(resource.id);
    return cacheEntry ? cacheEntry.lineCounter : undefined;
  }
}

/**
 * Extracts all unique namespaces from resources in specified resourceMap
 */

export function getNamespaces(resourceMap: ResourceMap) {
  const namespaces: string[] = [];
  Object.values(resourceMap).forEach(e => {
    if (e.kind === 'Namespace' && !namespaces.includes(e.name)) {
      namespaces.push(e.name);
    } else if (e.namespace && !namespaces.includes(e.namespace)) {
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
  if (!hasFullAccess && clusterAccess?.length) {
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

export function createResourceName(object: K8sObject, filePath?: string) {
  // for Kustomizations we return the name of the containing folder ('base', 'staging', etc)
  if (
    filePath &&
    object.kind === KUSTOMIZATION_KIND &&
    (!object?.apiVersion || object.apiVersion.startsWith(KUSTOMIZATION_API_GROUP))
  ) {
    const ix = filePath.lastIndexOf(path.sep);
    if (ix > 0) {
      return filePath.substr(1, ix - 1);
    }
    return filePath;
  }

  // use metadata name if available
  if (object.metadata?.name) {
    // name could be an object if it's a helm template value...
    if (typeof object.metadata.name !== 'string') {
      return JSON.stringify(object.metadata.name).trim();
    }

    return object.metadata.name;
  }

  // use filename as last resort if it's provided
  if (filePath) {
    const ix = filePath.lastIndexOf(path.sep);
    if (ix > 0) {
      return filePath.substr(ix + 1);
    }

    return filePath;
  }

  return 'Unnamed resource';
}

/**
 * Checks if this specified resource is unsaved
 */

export function isUnsavedResource(resource: K8sResource) {
  // TODO: maybe this could be removed
  return resource.isUnsaved;
}

/**
 * Saves the specified value to the file of the specified resource - handles both
 * single and multi-resource files
 */

export function saveResource(resource: K8sResource, newValue: string, fileMap: FileMapType) {
  let valueToWrite = `${newValue.trim()}\n`;

  if (isLocalResource(resource)) {
    const fileEntry = fileMap[resource.origin.filePath];

    let absoluteResourcePath = getAbsoluteResourcePath(resource, fileMap);
    if (resource.range) {
      const content = fs.readFileSync(absoluteResourcePath, 'utf8');

      // need to make sure that document delimiter is still there if this resource was not first in the file
      if (resource.range.start > 0 && !doesTextStartWithYamlDocumentDelimiter(valueToWrite)) {
        valueToWrite = `${YAML_DOCUMENT_DELIMITER}\n${valueToWrite}`;
      }

      const newFileContent =
        content.substring(0, resource.range.start) +
        valueToWrite +
        content.substring(resource.range.start + resource.range.length);

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

export function removeResourceFromFile(
  removedResource: K8sResource,
  fileMap: FileMapType,
  stateArgs: {
    resourceMetaMap: ResourceMetaMap<LocalOrigin>;
    resourceContentMap: ResourceContentMap<LocalOrigin>;
  }
) {
  const {resourceMetaMap, resourceContentMap} = stateArgs;
  const resourceMap: ResourceMap = merge(resourceMetaMap, resourceContentMap);

  if (!isLocalResource(removedResource)) {
    throw new Error(`[removeResourceFromFile]: Specified resource is not from a file.`);
  }

  const fileEntry = fileMap[removedResource.origin.filePath];
  if (!fileEntry) {
    throw new Error(`Failed to find fileEntry for resource with path ${removedResource.origin.filePath}`);
  }
  const absoluteFilePath = getAbsoluteResourcePath(removedResource, fileMap);

  if (!fs.existsSync(absoluteFilePath)) {
    log.error(`[removeResourceFromFile] - ${absoluteFilePath} doesn't exist`);
    return;
  }

  // get list of resourceIds in file sorted by startPosition
  const resourceIds = getLocalResourceMetasForPath(removedResource.origin.filePath, resourceMetaMap)
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
  deleteResource(removedResource, {resourceMetaMap, resourceContentMap});
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

export function extractK8sResources<Origin extends AnyOrigin = AnyOrigin>(
  fileContent: string,
  origin: Origin
): K8sResource<Origin>[] {
  const lineCounter: LineCounter = new LineCounter();
  const documents = parseAllYamlDocuments(fileContent, lineCounter);
  const result: K8sResource<Origin>[] = [];
  let splitDocs: any;

  if (documents) {
    let docIndex = 0;
    documents.forEach(doc => {
      if (doc.errors.length > 0) {
        if (!splitDocs) {
          splitDocs = fileContent.split('---');
        }

        log.warn(
          `Ignoring document ${docIndex} in ${JSON.stringify(origin)} origin due to ${doc.errors.length} error(s)`,
          documents[docIndex],
          splitDocs && docIndex < splitDocs.length ? splitDocs[docIndex] : ''
        );
      } else {
        if (doc.warnings.length > 0) {
          log.warn('[extractK8sResources]: Doc has warnings', doc);
        }

        const resourceObject = doc.toJS();

        if (resourceObject && resourceObject.apiVersion && resourceObject.kind) {
          const text = fileContent.slice(doc.range[0], doc.range[1]);

          let resource: K8sResource<Origin> = {
            name: createResourceName(resourceObject, isLocalOrigin(origin) ? origin.filePath : undefined),
            origin,
            id: (resourceObject.metadata && resourceObject.metadata.uid) || uuidv4(),
            kind: resourceObject.kind,
            apiVersion: resourceObject.apiVersion,
            object: resourceObject,
            text,
            isClusterScoped: getResourceKindHandler(resourceObject.kind)?.isNamespaced || false,
          };

          if (
            resource.kind === 'CustomResourceDefinition' &&
            resource.object?.spec?.names?.kind &&
            !getResourceKindHandler(resource.object.spec.names.kind)
          ) {
            try {
              const kindHandler = extractKindHandler(resource.object);
              if (kindHandler) {
                registerKindHandler(kindHandler, false);
                const crdsDir = (window as any).monokleUserCrdsDir;
                if (typeof crdsDir === 'string') {
                  saveCRD(crdsDir, resource.text);
                }
              } else {
                log.warn('Failed to extract kindHandler', resource.object);
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
          resource.namespace = extractNamespace(resourceObject);

          result.push(resource);
        }
        // handle special case of untyped kustomization.yaml files
        else if (
          isLocalOrigin(origin) &&
          resourceObject &&
          isKustomizationFilePath(origin.filePath) &&
          documents.length === 1
        ) {
          let resource: K8sResource<Origin> = {
            name: createResourceName(resourceObject, origin.filePath),
            origin,
            id: uuidv4(),
            kind: KUSTOMIZATION_KIND,
            apiVersion: KUSTOMIZATION_API_VERSION,
            object: resourceObject,
            text: fileContent,
            isClusterScoped: getResourceKindHandler(resourceObject.kind)?.isNamespaced || false,
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
export function deleteResource(
  resource: ResourceIdentifier,
  stateArgs: {resourceMetaMap: ResourceMetaMap; resourceContentMap: ResourceContentMap}
) {
  const {resourceMetaMap, resourceContentMap} = stateArgs;
  delete resourceMetaMap[resource.id];
  delete resourceContentMap[resource.id];
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

export function isResourceSelected(resource: K8sResource | ResourceMeta | ResourceContent, selection: AppSelection) {
  return (
    isResourceSelection(selection) &&
    selection.resourceId === resource.id &&
    selection.resourceStorage === resource.origin.storage
  );
}

export function splitK8sResource<Origin extends AnyOrigin = AnyOrigin>(
  resource: K8sResource<Origin>
): {meta: ResourceMeta<Origin>; content: ResourceContent<Origin>} {
  const meta: ResourceMeta<Origin> = {
    id: resource.id,
    origin: resource.origin,
    name: resource.name,
    kind: resource.kind,
    apiVersion: resource.apiVersion,
    namespace: resource.namespace,
    isClusterScoped: resource.isClusterScoped,
    range: resource.range,
    isUnsaved: resource.isUnsaved,
  };
  const content: ResourceContent<Origin> = {
    id: resource.id,
    origin: resource.origin,
    text: resource.text,
    object: resource.object,
  };
  return {meta, content};
}

export function splitK8sResourceMap<Origin extends AnyOrigin = AnyOrigin>(
  resourceMap: ResourceMap<Origin> | K8sResource<Origin>[]
) {
  const metaMap: ResourceMetaMap<Origin> = {};
  const contentMap: ResourceContentMap<Origin> = {};
  Object.values(resourceMap).forEach(resource => {
    const {meta, content} = splitK8sResource(resource);
    metaMap[resource.id] = meta;
    contentMap[resource.id] = content;
  });
  return {metaMap, contentMap};
}
