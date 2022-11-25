import {v4 as uuidv4} from 'uuid';
import {stringify} from 'yaml';

import {UNSAVED_PREFIX} from '@constants/constants';

import {addMultipleResources, addResource} from '@redux/reducers/main';

import {parseYamlDocument} from '@utils/yaml';

import {getResourceKindHandler} from '@src/kindhandlers';

import {AppDispatch} from '@shared/models/appDispatch';
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
 * Creates an unsaved Resource which will have its filePath set as unsaved://resourceId
 */
export function createUnsavedResource(
  input: {name: string; kind: string; apiVersion: string; namespace?: string},
  dispatch: AppDispatch,
  jsonTemplate?: any
) {
  const newResourceId = uuidv4();
  let newResourceText: string;
  let newResourceContent: any;

  if (jsonTemplate) {
    if (jsonTemplate.kind && jsonTemplate.apiVersion) {
      newResourceContent = {
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
      newResourceContent = {
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

    newResourceText = stringify(newResourceContent);
  } else {
    newResourceText = createDefaultResourceText(input);
    newResourceContent = parseYamlDocument(newResourceText).toJS();
  }

  const newResource: K8sResource = {
    name: input.name,
    fileId: `${UNSAVED_PREFIX}${newResourceId}`,
    filePath: `${UNSAVED_PREFIX}${newResourceId}`,
    fileOffset: 0,
    id: newResourceId,
    isHighlighted: false,
    isSelected: false,
    kind: input.kind,
    apiVersion: input.apiVersion,
    namespace: input.namespace,
    text: newResourceText,
    content: newResourceContent,
    isClusterScoped: getResourceKindHandler(input.kind)?.isNamespaced || false,
  };
  dispatch(addResource(newResource));

  return newResource;
}

export function createMultipleUnsavedResources(
  inputs: {name: string; kind: string; apiVersion: string; namespace?: string; obj?: any}[],
  dispatch: AppDispatch
) {
  const resourceMap: any = {};

  inputs.forEach(input => {
    const resourceId = uuidv4();
    resourceMap[resourceId] = {};
    resourceMap[resourceId].input = input;

    if (input.obj) {
      resourceMap[resourceId].content = {
        ...input.obj,
        apiVersion: input.apiVersion,
        kind: input.kind,
        metadata: {
          ...(input.obj.metadata || {}),
          name: input.name,
          namespace: input.namespace,
        },
      };
      resourceMap[resourceId].text = stringify(resourceMap[resourceId].content);
    } else {
      resourceMap[resourceId].text = createDefaultResourceText(input);
      resourceMap[resourceId].content = parseYamlDocument(resourceMap[resourceId].text).toJS();
    }
  });

  const newResources: K8sResource[] = Object.keys(resourceMap).map(resourceId => ({
    name: resourceMap[resourceId].input.name,
    fileId: `${UNSAVED_PREFIX}${resourceId}`,
    filePath: `${UNSAVED_PREFIX}${resourceId}`,
    fileOffset: 0,
    id: resourceId,
    isHighlighted: false,
    isSelected: false,
    kind: resourceMap[resourceId].input.kind,
    apiVersion: resourceMap[resourceId].input.apiVersion,
    namespace: resourceMap[resourceId].input.namespace,
    text: resourceMap[resourceId].text,
    content: resourceMap[resourceId].content,
    isClusterScoped: getResourceKindHandler(resourceMap[resourceId].input.kind)?.isNamespaced || false,
  }));

  dispatch(addMultipleResources(newResources));

  return newResources;
}
