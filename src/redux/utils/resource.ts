import {JSONPath} from 'jsonpath-plus';
import path from 'path';
import {ResourceMapType} from '@models/appstate';
import {K8sResource, ResourceRefType} from '@models/k8sresource';
import {FileEntry} from '@models/fileentry';
import fs from 'fs';
import {PREVIEW_PREFIX, YAML_DOCUMENT_DELIMITER} from '@src/constants';

export function processServices(resourceMap: ResourceMapType) {
  const deployments = getK8sResources(resourceMap, 'Deployment').filter(
    d => d.content.spec?.template?.metadata?.labels
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
          service.refs = service.refs || [];
          service.refs.push({refType: ResourceRefType.UnsatisfiedSelector, target: service.content.spec.selector[e]});
        }
      });
    }
  });
}

export function processConfigMaps(resourceMap: ResourceMapType) {
  const configMaps = getK8sResources(resourceMap, 'ConfigMap').filter(e => e.content?.metadata?.name);
  if (configMaps) {
    getK8sResources(resourceMap, 'Deployment').forEach(deployment => {
      JSONPath({path: '$..configMapRef.name', json: deployment.content}).forEach((refName: string) => {
        let found = false;
        configMaps
          .filter(item => item.content.metadata.name === refName)
          .forEach(configMapResource => {
            linkResources(
              configMapResource,
              deployment,
              ResourceRefType.ConfigMapRef,
              ResourceRefType.ConfigMapConsumer
            );
            found = true;
          });
        if (!found) {
          deployment.refs = deployment.refs || [];
          deployment.refs.push({refType: ResourceRefType.UnsatisfiedConfigMap, target: refName});
        }
      });

      JSONPath({path: '$..configMapKeyRef.name', json: deployment.content}).forEach((refName: string) => {
        let found = false;
        configMaps
          .filter(item => item.content.metadata.name === refName)
          .forEach(configMapResource => {
            linkResources(
              configMapResource,
              deployment,
              ResourceRefType.ConfigMapRef,
              ResourceRefType.ConfigMapConsumer
            );
            found = true;
          });
        if (!found) {
          deployment.refs = deployment.refs || [];
          deployment.refs.push({refType: ResourceRefType.UnsatisfiedConfigMap, target: refName});
        }
      });

      JSONPath({path: '$..volumes[*].configMap.name', json: deployment.content}).forEach((refName: string) => {
        let found = false;
        configMaps
          .filter(item => item.content.metadata.name === refName)
          .forEach(configMapResource => {
            linkResources(
              configMapResource,
              deployment,
              ResourceRefType.ConfigMapRef,
              ResourceRefType.ConfigMapConsumer
            );
            found = true;
          });
        if (!found) {
          deployment.refs = deployment.refs || [];
          deployment.refs.push({refType: ResourceRefType.UnsatisfiedConfigMap, target: refName});
        }
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
  if (!source.refs.some(ref => ref.refType === sourceRefType && ref.target === target.id)) {
    source.refs.push({
      refType: sourceRefType,
      target: target.id,
    });
  }

  target.refs = target.refs || [];
  if (!target.refs.some(ref => ref.refType === targetRefType && ref.target === source.id)) {
    target.refs.push({
      refType: targetRefType,
      target: source.id,
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

const unsatisfiedRefs = [ResourceRefType.UnsatisfiedConfigMap, ResourceRefType.UnsatisfiedSelector];

export function isIncomingRef(e: ResourceRefType) {
  return incomingRefs.includes(e);
}

export function isOutgoingRef(e: ResourceRefType) {
  return outgoingRefs.includes(e);
}

export function isUnsatisfiedRef(e: ResourceRefType) {
  return unsatisfiedRefs.includes(e);
}

export function hasIncomingRefs(resource: K8sResource) {
  return resource.refs?.some(e => isIncomingRef(e.refType));
}

export function hasOutgoingRefs(resource: K8sResource) {
  return resource.refs?.some(e => isOutgoingRef(e.refType));
}

export function hasRefs(resource: K8sResource) {
  return resource.refs?.some(e => isOutgoingRef(e.refType));
}

export function hasUnsatisfiedRefs(resource: K8sResource) {
  return resource.refs?.some(e => isUnsatisfiedRef(e.refType));
}

function isFileResource(resource: K8sResource) {
  return !resource.path.startsWith(PREVIEW_PREFIX);
}

export function saveResource(resource: K8sResource, newValue: string) {
  let valueToWrite = `${newValue.trim()}\n`;

  if (isFileResource(resource)) {
    if (resource.range) {
      const content = fs.readFileSync(resource.path, 'utf8');

      // need to make sure that document delimiter is still there if this resource was not first in the file
      if (resource.range.start > 0 && !valueToWrite.startsWith(YAML_DOCUMENT_DELIMITER)) {
        valueToWrite = `${YAML_DOCUMENT_DELIMITER}${valueToWrite}`;
      }

      fs.writeFileSync(
        resource.path,
        content.substr(0, resource.range.start) +
          valueToWrite +
          content.substr(resource.range.start + resource.range.length)
      );
    } else {
      // only document => just write to file
      fs.writeFileSync(resource.path, newValue);
    }
  }

  return valueToWrite;
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
