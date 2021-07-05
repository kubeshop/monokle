import {JSONPath} from 'jsonpath-plus';
import path from 'path';
import {AppState, FileMapType, ResourceMapType} from '@models/appstate';
import {K8sResource, ResourceRefType} from '@models/k8sresource';
import {FileEntry} from '@models/fileentry';
import fs from 'fs';
import {PREVIEW_PREFIX, YAML_DOCUMENT_DELIMITER} from '@src/constants';
import {processKustomizations} from '@redux/utils/kustomize';
import {getAbsoluteResourcePath, getResourcesForPath} from '@redux/utils/fileEntry';
import {LineCounter, parseAllDocuments} from 'yaml';
import log from 'loglevel';
import {isUnsatisfiedRef} from '@redux/utils/resourceRefs';
import {v4 as uuidv4} from 'uuid';

/**
 * Processes all services in the specified resourceMap and creates
 * applicable resourcerefs
 */

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
            deployment => deployment.content.spec.template.metadata.labels[e] === service.content.spec.selector[e]
          )
          .forEach(deployment => {
            linkResources(deployment, service, ResourceRefType.SelectedPodName, ResourceRefType.ServicePodSelector);
            found = true;
          });
        if (!found) {
          createResourceRef(service, service.content.spec.selector[e], ResourceRefType.UnsatisfiedSelector);
        }
      });
    }
  });
}

/**
 * Adds configmap resourcerefs for specified configMapName to deployment
 */

function linkConfigMapToDeployment(configMaps: K8sResource[], configMapName: string, deployment: K8sResource) {
  let found = false;
  configMaps
    .filter(item => item.content.metadata.name === configMapName)
    .forEach(configMapResource => {
      linkResources(configMapResource, deployment, ResourceRefType.ConfigMapRef, ResourceRefType.ConfigMapConsumer);
      found = true;
    });
  if (!found) {
    createResourceRef(deployment, configMapName, ResourceRefType.UnsatisfiedConfigMap);
  }
}

/**
 * Processes all configmaps in provided resourceMap and creates
 * applicable resourcerefs
 */

export function processConfigMaps(resourceMap: ResourceMapType) {
  const configMaps = getK8sResources(resourceMap, 'ConfigMap').filter(e => e.content?.metadata?.name);
  if (configMaps) {
    getK8sResources(resourceMap, 'Deployment').forEach(deployment => {
      JSONPath({path: '$..configMapRef.name', json: deployment.content}).forEach((refName: string) => {
        linkConfigMapToDeployment(configMaps, refName, deployment);
      });

      JSONPath({path: '$..configMapKeyRef.name', json: deployment.content}).forEach((refName: string) => {
        linkConfigMapToDeployment(configMaps, refName, deployment);
      });

      JSONPath({path: '$..volumes[*].configMap.name', json: deployment.content}).forEach((refName: string) => {
        linkConfigMapToDeployment(configMaps, refName, deployment);
      });
    });
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
function createResourceRef(resource: K8sResource, target: string, refType: ResourceRefType) {
  resource.refs = resource.refs || [];
  if (!resource.refs.some(ref => ref.refType === refType && ref.target === target)) {
    resource.refs.push({refType, target});
  }
}

/**
 * Creates bidirectional resourcerefs between two resources
 */

export function linkResources(
  source: K8sResource,
  target: K8sResource,
  sourceRefType: ResourceRefType,
  targetRefType: ResourceRefType
) {
  createResourceRef(source, target.id, sourceRefType);
  createResourceRef(target, source.id, targetRefType);
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
 * Checks if the specified resource is a kustomization resource
 */

export function isKustomizationResource(r: K8sResource | undefined) {
  return r && r.kind === 'Kustomization';
}

/**
 * Checks if the specified fileEntry is a kustomization file
 */

export function isKustomizationFile(fileEntry: FileEntry, resourceMap: ResourceMapType) {
  if (fileEntry.name.toLowerCase() === 'kustomization.yaml') {
    const resources = getResourcesForPath(fileEntry.filePath, resourceMap);
    return resources.length === 1 && isKustomizationResource(resources[0]);
  }

  return false;
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
          content.substr(resource.range.start + resource.range.length)
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
 * Reprocesses the specified resourceIds in regard to refs/etc (called after updating...)
 *
 * This could be more intelligent - it updates everythign brute force for now...
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
  Object.values(resourceMap).forEach(r => {
    r.refs = undefined;
    if (isKustomizationResource(r)) {
      hasKustomizations = true;
    }
  });

  if (hasKustomizations) {
    processKustomizations(resourceMap, fileMap);
  }

  processParsedResources(resourceMap);
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
    documents.forEach(d => {
      if (d.errors.length > 0) {
        log.warn(
          `Ignoring document ${docIndex} in ${path.parse(relativePath).name} due to ${d.errors.length} error(s)`,
        );
        d.errors.forEach(e => log.warn(e.message));
      } else {
        const content = d.toJS();
        if (content && content.apiVersion && content.kind) {
          let resource: K8sResource = {
            name: createResourceName(relativePath, content),
            filePath: relativePath,
            id: uuidv4(),
            kind: content.kind,
            version: content.apiVersion,
            content,
            highlight: false,
            selected: false,
            text: fileContent.slice(d.range[0], d.range[1]),
          };

          if (documents.length > 1) {
            resource.range = {start: d.range[0], length: d.range[1] - d.range[0]};
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
      linkedResourceIds.push(ref.target);
    });

  return linkedResourceIds;
}
