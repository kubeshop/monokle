import {v4 as uuidv4} from 'uuid';

import {addMultipleResources, addResource} from '@redux/reducers/main';

import {parseYamlDocument, stringifyK8sResource} from '@utils/yaml';

import {getResourceKindHandler} from '@src/kindhandlers';

import {AppDispatch} from '@shared/models/appDispatch';
import {K8sObject} from '@shared/models/k8s';
import {K8sResource} from '@shared/models/k8sResource';

function createDefaultResourceText(input: {name: string; kind: string; apiVersion?: string; namespace?: string}) {
  return `
apiVersion: ${input.apiVersion ? input.apiVersion : 'v1'}
kind: ${input.kind}
metadata:
  name: ${input.name}
  ${input.namespace ? `namespace: ${input.namespace}` : ''}
  `.trim();
}

/**
 * Creates an transient Resource which will have its filePath set as transient://resourceId
 */
export function createTransientResource(
  input: {name: string; kind: string; apiVersion: string; namespace?: string},
  dispatch: AppDispatch,
  createdIn: 'local' | 'cluster',
  jsonTemplate?: Partial<K8sObject>,
  saveToFileOrFolder?: boolean
) {
  const newResourceId = uuidv4();
  let newResourceText: string;
  let newResourceObject: K8sObject;

  if (jsonTemplate) {
    if (jsonTemplate.kind && jsonTemplate.apiVersion) {
      newResourceObject = {
        ...jsonTemplate,
        apiVersion: input.apiVersion,
        kind: input.kind,
        metadata: {
          ...(jsonTemplate.metadata || {}),
          name: input.name,
          namespace: input.namespace,
        },
      };
    } else {
      newResourceObject = {
        apiVersion: input.apiVersion,
        kind: input.kind,
        metadata: {
          ...(jsonTemplate.metadata || {}),
          name: input.name,
          namespace: input.namespace,
        },
        ...jsonTemplate,
      };
    }

    newResourceText = stringifyK8sResource(newResourceObject);
  } else {
    newResourceText = createDefaultResourceText(input);
    newResourceObject = parseYamlDocument(newResourceText).toJS();
  }

  const newResource: K8sResource = {
    name: input.name,
    storage: 'transient',
    origin: {createdIn},
    id: newResourceId,
    kind: input.kind,
    apiVersion: input.apiVersion,
    namespace: input.namespace,
    text: newResourceText,
    object: newResourceObject,
    isClusterScoped: getResourceKindHandler(input.kind)?.isNamespaced || false,
  };

  if (!saveToFileOrFolder) {
    dispatch(addResource(newResource));
  }

  return newResource;
}

export function createMultipleTransientResources(
  inputs: {name: string; kind: string; apiVersion: string; namespace?: string; obj?: K8sObject}[],
  createdIn: 'local' | 'cluster',
  dispatch: AppDispatch
) {
  const resources: K8sResource[] = [];

  inputs.forEach(input => {
    let resourceText: string;
    let resourceObject: K8sObject;

    if (input.obj) {
      resourceObject = {
        ...input.obj,
        apiVersion: input.apiVersion,
        kind: input.kind,
        metadata: {
          ...(input.obj.metadata || {}),
          name: input.name,
          namespace: input.namespace,
        },
      };
      resourceText = stringifyK8sResource(resourceObject);
    } else {
      resourceText = createDefaultResourceText(input);
      resourceObject = parseYamlDocument(resourceText).toJS();
    }

    const newResource: K8sResource = {
      id: uuidv4(),
      storage: 'transient',
      origin: {createdIn},
      name: input.name,
      kind: input.kind,
      namespace: input.namespace,
      apiVersion: input.apiVersion,
      isClusterScoped: getResourceKindHandler(input.kind)?.isNamespaced || false,
      text: resourceText,
      object: resourceObject,
    };

    resources.push(newResource);
  });

  dispatch(addMultipleResources(resources));

  return resources;
}
