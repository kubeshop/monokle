import {v4 as uuidv4} from 'uuid';
import {stringify} from 'yaml';

import {UNSAVED_PREFIX} from '@constants/constants';

import {AppDispatch} from '@models/appdispatch';
import {K8sResource} from '@models/k8sresource';

import {addResource, selectK8sResource} from '@redux/reducers/main';

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
