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
    const resourceID = uuidv4();
    resourceMap[resourceID] = {};
    resourceMap[resourceID].input = input;

    if (input.obj) {
      resourceMap[resourceID].content = {
        ...input.obj,
        apiVersion: input.apiVersion,
        kind: input.kind,
        metadata: {
          ...(input.obj.metadata || {}),
          name: input.name,
          namespace: input.namespace,
        },
      };
      resourceMap[resourceID].text = stringify(resourceMap[resourceID].content);
    } else {
      resourceMap[resourceID].text = createDefaultResourceText(input);
      resourceMap[resourceID].content = parseYamlDocument(resourceMap[resourceID].text).toJS();
    }
  });

  const newResources: K8sResource[] = Object.keys(resourceMap).map(resourceID => ({
    name: resourceMap[resourceID].input.name,
    filePath: `${UNSAVED_PREFIX}${resourceID}`,
    id: resourceID,
    isHighlighted: false,
    isSelected: false,
    kind: resourceMap[resourceID].input.kind,
    version: resourceMap[resourceID].input.apiVersion,
    namespace: resourceMap[resourceID].input.namespace,
    text: resourceMap[resourceID].text,
    content: resourceMap[resourceID].content,
  }));

  dispatch(addMultipleResources(newResources));
  dispatch(selectK8sResource({resourceId: newResources[newResources.length - 1].id}));

  return newResources;
}
