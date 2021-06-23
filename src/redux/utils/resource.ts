import {JSONPath} from 'jsonpath-plus';
import path from 'path';
import {ResourceMapType} from '@models/appstate';
import {K8sResource, ResourceRefType} from '@models/k8sresource';
import {FileEntry} from '@models/fileentry';

/**
 * link services to target deployments via their label selector if specified
 */
export function processServices(resourceMap: ResourceMapType) {
  const deployments = getK8sResources(resourceMap, 'Deployment').filter(
    d => d.content.spec?.template?.metadata?.labels
  );

  getK8sResources(resourceMap, 'Service').forEach(service => {
    if (service.content?.spec?.selector) {
      Object.keys(service.content.spec.selector).forEach((e: any) => {
        deployments
          .filter(
            deployment => deployment.content.spec.template.metadata.labels[e] === service.content.spec.selector[e]
          )
          .forEach(deployment => {
            linkResources(deployment, service, ResourceRefType.SelectedPodName, ResourceRefType.ServicePodSelector);
          });
      });
    }
  });
}

export function processConfigMaps(resourceMap: ResourceMapType) {
  const configMaps = getK8sResources(resourceMap, 'ConfigMap').filter(e => e.content?.metadata?.name);
  if (configMaps) {
    getK8sResources(resourceMap, 'Deployment').forEach(deployment => {
      JSONPath({path: '$..configMapRef.name', json: deployment.content}).forEach((refName: string) => {
        configMaps
          .filter(item => item.content.metadata.name === refName)
          .forEach(configMapResource => {
            linkResources(
              configMapResource,
              deployment,
              ResourceRefType.ConfigMapRef,
              ResourceRefType.ConfigMapConsumer
            );
          });
      });

      JSONPath({path: '$..configMapKeyRef.name', json: deployment.content}).forEach((refName: string) => {
        configMaps
          .filter(item => item.content.metadata.name === refName)
          .forEach(configMapResource => {
            linkResources(
              configMapResource,
              deployment,
              ResourceRefType.ConfigMapRef,
              ResourceRefType.ConfigMapConsumer
            );
          });
      });

      JSONPath({path: '$..volumes[*].configMap.name', json: deployment.content}).forEach((refName: string) => {
        configMaps
          .filter(item => item.content.metadata.name === refName)
          .forEach(configMapResource => {
            linkResources(
              configMapResource,
              deployment,
              ResourceRefType.ConfigMapRef,
              ResourceRefType.ConfigMapConsumer
            );
          });
      });
    });
  }
}

export function getK8sResources(resourceMap: ResourceMapType, type: string) {
  return Object.values(resourceMap).filter(item => item.kind === type);
}

export function linkResources(
  source: K8sResource,
  target: K8sResource,
  sourceRefType: ResourceRefType,
  targetRefType: ResourceRefType
) {
  source.refs = source.refs || [];
  if (!source.refs.some(ref => ref.refType === sourceRefType && ref.targetResourceId === target.id)) {
    source.refs.push({
      refType: sourceRefType,
      targetResourceId: target.id,
    });
  }

  target.refs = target.refs || [];
  if (!target.refs.some(ref => ref.refType === targetRefType && ref.targetResourceId === source.id)) {
    target.refs.push({
      refType: targetRefType,
      targetResourceId: source.id,
    });
  }
}

export function getNamespaces(resourceMap: ResourceMapType) {
  const namespaces: string[] = [];
  Object.values(resourceMap).forEach(e => {
    if (e.namespace && !namespaces.includes(e.namespace)) {
      namespaces.push(e.namespace);
    }
  });
  return namespaces;
}

export function createResourceName(filePath: string, content: any) {
  if (content.kind === 'Kustomization') {
    const ix = filePath.lastIndexOf(path.sep);
    if (ix > 0) {
      const ix2 = filePath.lastIndexOf(path.sep, ix - 1);
      if (ix2 > 0) {
        return filePath.substr(ix2 + 1, ix - ix2 - 1);
      }
      return filePath.substr(0, ix);
    }
    return filePath;
  }

  let name = content.metadata?.name ? `${content.metadata.name} ` : '';
  return `${name + content.kind} [${content.apiVersion}]`;
}

export function isKustomizationResource(r: K8sResource | undefined) {
  return r && r.kind === 'Kustomization';
}

export function isKustomizationFile(childFileEntry: FileEntry, resourceMap: ResourceMapType) {
  if (childFileEntry.name.toLowerCase() === 'kustomization.yaml' && childFileEntry.resourceIds) {
    const r = resourceMap[childFileEntry.resourceIds[0]];
    return isKustomizationResource(r);
  }

  return false;
}

const incomingRefs = [
  ResourceRefType.KustomizationParent,
  ResourceRefType.ConfigMapRef,
  ResourceRefType.SelectedPodName,
];
const outgoingRefs = [
  ResourceRefType.KustomizationResource,
  ResourceRefType.ConfigMapConsumer,
  ResourceRefType.ServicePodSelector,
];

export function isIncomingRef(e: ResourceRefType) {
  return incomingRefs.includes(e);
}

export function isOutgoingRef(e: ResourceRefType) {
  return outgoingRefs.includes(e);
}

export function hasIncomingRefs(resource: K8sResource) {
  return resource.refs?.find(e => isIncomingRef(e.refType));
}

export function hasOutgoingRefs(resource: K8sResource) {
  return resource.refs?.find(e => isOutgoingRef(e.refType));
}

// taken from https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    // eslint-disable-next-line no-bitwise
    const r = (Math.random() * 16) | 0;
    // eslint-disable-next-line no-bitwise
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
