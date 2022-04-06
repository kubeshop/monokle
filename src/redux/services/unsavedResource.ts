import {v4 as uuidv4} from 'uuid';
import {stringify} from 'yaml';

import {UNSAVED_PREFIX} from '@constants/constants';

import {AppDispatch} from '@models/appdispatch';
import {K8sResource} from '@models/k8sresource';

import {addMultipleResources, addResource, selectK8sResource} from '@redux/reducers/main';

import {parseYamlDocument} from '@utils/yaml';

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
    newResourceText = stringify(newResourceContent);
  } else {
    newResourceText = createDefaultResourceText(input);
    newResourceContent = parseYamlDocument(newResourceText).toJS();
  }

  const newResource: K8sResource = {
    name: input.name,
    filePath: `${UNSAVED_PREFIX}${newResourceId}`,
    id: newResourceId,
    isHighlighted: false,
    isSelected: false,
    kind: input.kind,
    version: input.apiVersion,
    namespace: input.namespace,
    text: newResourceText,
    content: newResourceContent,
  };
  dispatch(addResource(newResource));
  dispatch(selectK8sResource({resourceId: newResource.id}));

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
    filePath: `${UNSAVED_PREFIX}${resourceId}`,
    id: resourceId,
    isHighlighted: false,
    isSelected: false,
    kind: resourceMap[resourceId].input.kind,
    version: resourceMap[resourceId].input.apiVersion,
    namespace: resourceMap[resourceId].input.namespace,
    text: resourceMap[resourceId].text,
    content: resourceMap[resourceId].content,
  }));

  dispatch(addMultipleResources(newResources));
  dispatch(selectK8sResource({resourceId: newResources[newResources.length - 1].id}));

  return newResources;
}
