import fs from 'fs';
import {uniq} from 'lodash';
import log from 'loglevel';
import path from 'path';
import {v4 as uuidv4} from 'uuid';
import {LineCounter} from 'yaml';

import {
  KUSTOMIZATION_API_GROUP,
  KUSTOMIZATION_API_VERSION,
  KUSTOMIZATION_KIND,
  YAML_DOCUMENT_DELIMITER,
} from '@constants/constants';

import {createKubeClientWithSetup} from '@redux/cluster/service/kube-client';
import {RESOURCE_PARSER} from '@redux/parsing/resourceParser';
import {getAbsoluteResourcePath, getLocalResourceMetasForPath} from '@redux/services/fileEntry';
import {processK8sResourceDoc} from '@redux/thunks/utils';

// import {VALIDATOR} from '@redux/validation/validation.services';
import {saveCRD} from '@utils/crds';
import {getFileTimestamp} from '@utils/files';
import {parseAllYamlDocuments} from '@utils/yaml';

import {getResourceKindHandler, registerKindHandler} from '@src/kindhandlers';
import NamespaceHandler from '@src/kindhandlers/Namespace.handler';
import {extractKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';

import {FileMapType} from '@shared/models/appState';
import {ClusterAccess} from '@shared/models/config';
import {K8sObject} from '@shared/models/k8s';
import {
  K8sResource,
  OriginFromStorage,
  ResourceContent,
  ResourceContentMap,
  ResourceIdentifier,
  ResourceMap,
  ResourceMeta,
  ResourceMetaMap,
  ResourceStorage,
  isLocalResource,
  isLocalResourceMeta,
} from '@shared/models/k8sResource';
import {isLocalOrigin} from '@shared/models/origin';
import {AnyPreview, isKustomizePreview} from '@shared/models/preview';
import {AppSelection, isResourceSelection} from '@shared/models/selection';
import {isKustomizationFilePath} from '@shared/utils/kustomize';
import {AllKeysRequired} from '@shared/utils/types';

/**
 * Parse documents lazily...
 */

export function doesTextStartWithYamlDocumentDelimiter(text: string) {
  return ['\n', '\r\n', '\r'].some(lineEnding => {
    return text.startsWith(`${YAML_DOCUMENT_DELIMITER}${lineEnding}`);
  });
}

/**
 * Utility function to get all resources of a specific kind
 */

export function getResourcesOfKind(resourceMap: ResourceMap, kind: string) {
  return Object.values(resourceMap).filter(item => item.kind === kind);
}

/**
 * Extracts all unique namespaces from resources in specified resourceMap
 */

export function getNamespaces(resourceMetaMap: ResourceMetaMap) {
  const namespaces: string[] = [];
  Object.values(resourceMetaMap).forEach(e => {
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
    const kubeClient = await createKubeClientWithSetup({context, kubeconfig: kubeconfigPath});
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
  removedResource: ResourceMeta<'local'>,
  fileMap: FileMapType,
  stateArgs: {
    resourceMetaMap: ResourceMetaMap<'local'>;
    resourceContentMap: ResourceContentMap<'local'>;
  }
) {
  const {resourceMetaMap, resourceContentMap} = stateArgs;
  const resourceMap: ResourceMap = joinK8sResourceMap(resourceMetaMap, resourceContentMap);

  if (!isLocalResourceMeta(removedResource)) {
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

export function extractResourceMeta<Storage extends ResourceStorage>(
  resourceObject: any,
  storage: Storage,
  origin: OriginFromStorage<Storage>,
  id?: string
): AllKeysRequired<ResourceMeta<Storage>> {
  return {
    name: createResourceName(resourceObject, isLocalOrigin(origin) ? origin.filePath : undefined),
    storage,
    origin,
    id: id ?? ((resourceObject.metadata && resourceObject.metadata.uid) || uuidv4()),
    namespace: resourceObject.metadata?.namespace || undefined,
    kind: resourceObject.kind,
    apiVersion: resourceObject.apiVersion,
    isClusterScoped: getResourceKindHandler(resourceObject.kind)?.isNamespaced || false,
    labels: resourceObject.metadata?.labels || {},
    templateLabels: resourceObject.spec?.template?.metadata?.labels || {},
    annotations: resourceObject.metadata?.annotations || {},
    range: undefined,
    refs: undefined,
  };
}

/**
 * Extracts all resources from the specified text content (must be yaml)
 */

export function extractK8sResources<
  Storage extends ResourceStorage = ResourceStorage,
  Origin extends OriginFromStorage<Storage> = OriginFromStorage<Storage>
>(fileContent: string, storage: Storage, origin: Origin): K8sResource<Storage>[] {
  const lineCounter: LineCounter = new LineCounter();
  const documents = parseAllYamlDocuments(fileContent, lineCounter);
  const result: K8sResource<Storage>[] = [];
  let splitDocs: any;

  if (documents) {
    let docIndex = 0;
    documents.forEach(doc => {
      if (doc.errors.length > 0) {
        if (!splitDocs) {
          splitDocs = fileContent.split('---');
        }

        log.warn(
          `Ignoring document ${docIndex} in ${JSON.stringify(origin)} origin due to ${doc.errors.length} error(s)`
        );
      } else {
        if (doc.warnings.length > 0) {
          log.warn('[extractK8sResources]: Doc has warnings', doc);
        }

        const resourceObject = processK8sResourceDoc(doc).toJS();
        const rawFileOffset = lineCounter.linePos(doc.range[0]).line;
        const fileOffset = rawFileOffset === 1 ? 0 : rawFileOffset;

        const transformedOrigin = isLocalOrigin(origin)
          ? {
              ...origin,
              fileOffset,
            }
          : origin;

        if (resourceObject && resourceObject.apiVersion && resourceObject.kind) {
          const text = fileContent.slice(doc.range[0], doc.range[1]);

          let resource: K8sResource<Storage> = {
            name: createResourceName(resourceObject, isLocalOrigin(origin) ? origin.filePath : undefined),
            storage,
            origin: transformedOrigin,
            id: (resourceObject.metadata && resourceObject.metadata.uid) || uuidv4(),
            kind: resourceObject.kind,
            apiVersion: resourceObject.apiVersion,
            object: resourceObject,
            text,
            isClusterScoped: getResourceKindHandler(resourceObject.kind)?.isNamespaced || false,
            labels: resourceObject.metadata?.labels || {},
            templateLabels: resourceObject.spec?.template?.metadata?.labels || {},
            annotations: resourceObject.metadata?.annotations || {},
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
          if (documents.length !== 1) {
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
          let resource: K8sResource<Storage> = {
            name: createResourceName(resourceObject, origin.filePath),
            storage,
            origin: transformedOrigin,
            id: uuidv4(),
            kind: KUSTOMIZATION_KIND,
            apiVersion: KUSTOMIZATION_API_VERSION,
            object: resourceObject,
            text: fileContent,
            isClusterScoped: getResourceKindHandler(resourceObject.kind)?.isNamespaced || false,
            labels: resourceObject.metadata?.labels || {},
            templateLabels: resourceObject.spec?.template?.metadata?.labels || {},
            annotations: resourceObject.metadata?.annotations || {},
          };

          // if this is a single-resource file we can save the parsedDoc and lineCounter
          result.push(resource);
        }
      }
      docIndex += 1;
    });
  }
  return result.filter(isSupportedResource);
}

/**
 * Deletes the specified resource from internal caches and the specified resourceMap
 */
export function deleteResource<Storage extends ResourceStorage>(
  resource: ResourceIdentifier<Storage>,
  stateArgs: {resourceMetaMap: ResourceMetaMap<Storage>; resourceContentMap: ResourceContentMap<Storage>}
) {
  const {resourceMetaMap, resourceContentMap} = stateArgs;
  delete resourceMetaMap[resource.id];
  delete resourceContentMap[resource.id];
  RESOURCE_PARSER.clear([resource.id]);
}

/**
 * check if the k8sResource is supported - currently excludes any resources
 * that have one of []{} in their name/namespace/kind/apiVersion
 * (for example helm templates with template syntax in any of these)
 */

const unsupportedCharactersRegEx = /[{}\[\]]+/;

export function isSupportedResource(resource: ResourceMeta): boolean {
  return (
    !unsupportedCharactersRegEx.test(resource.apiVersion) &&
    !unsupportedCharactersRegEx.test(resource.kind) &&
    !unsupportedCharactersRegEx.test(resource.name) &&
    (!resource.namespace || !unsupportedCharactersRegEx.test(resource.namespace))
  );
}

export function isResourceSelected(resourceIdentifier: ResourceIdentifier, selection: AppSelection | undefined) {
  return (
    isResourceSelection(selection) &&
    selection.resourceIdentifier.id === resourceIdentifier.id &&
    selection.resourceIdentifier.storage === resourceIdentifier.storage
  );
}

export function isResourceHighlighted(resource: ResourceIdentifier, highlights: AppSelection[] | undefined) {
  return highlights?.some(highlight => isResourceSelected(resource, highlight)) || false;
}

export function isKustomizationPreviewed(kustomization: ResourceIdentifier, preview: AnyPreview | undefined) {
  return isKustomizePreview(preview) && preview.kustomizationId === kustomization.id;
}

export function splitK8sResource<Storage extends ResourceStorage = ResourceStorage>(
  resource: K8sResource<Storage>
): {meta: ResourceMeta<Storage>; content: ResourceContent<Storage>} {
  const meta: AllKeysRequired<ResourceMeta<Storage>> = {
    id: resource.id,
    storage: resource.storage,
    origin: resource.origin,
    name: resource.name,
    kind: resource.kind,
    apiVersion: resource.apiVersion,
    labels: resource.labels,
    annotations: resource.annotations,
    templateLabels: resource.templateLabels,
    namespace: resource.namespace,
    isClusterScoped: resource.isClusterScoped,
    range: resource.range,
    refs: resource.refs,
  };
  const content: AllKeysRequired<ResourceContent<Storage>> = {
    id: resource.id,
    storage: resource.storage,
    text: resource.text,
    object: resource.object,
  };
  return {meta, content};
}

export function joinK8sResource<Storage extends ResourceStorage = ResourceStorage>(
  meta: ResourceMeta<Storage>,
  content: ResourceContent<Storage>
): K8sResource<Storage> {
  return {...meta, ...content};
}

export function splitK8sResourceMap<Storage extends ResourceStorage = ResourceStorage>(
  resourceMap: ResourceMap<Storage> | K8sResource<Storage>[]
) {
  const metaMap: ResourceMetaMap<Storage> = {};
  const contentMap: ResourceContentMap<Storage> = {};
  Object.values(resourceMap).forEach(resource => {
    const {meta, content} = splitK8sResource(resource);
    metaMap[resource.id] = meta;
    contentMap[resource.id] = content;
  });
  return {metaMap, contentMap};
}

export function joinK8sResourceMap<Storage extends ResourceStorage = ResourceStorage>(
  metaMap: ResourceMetaMap<Storage>,
  contentMap: ResourceContentMap<Storage>
) {
  const resourceMap: ResourceMap<Storage> = {};
  Object.values(metaMap).forEach(meta => {
    const content = contentMap[meta.id];
    if (content) {
      resourceMap[meta.id] = {...meta, ...content};
    }
  });
  return resourceMap;
}
