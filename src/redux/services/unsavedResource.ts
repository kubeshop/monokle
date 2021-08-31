import {v4 as uuidv4} from 'uuid';
import {parseDocument} from 'yaml';
import {UNSAVED_PREFIX} from '@constants/constants';
import {AppDispatch} from '@redux/store';
import {K8sResource} from '@models/k8sresource';
import {addResource, selectK8sResource} from '@redux/reducers/main';

function createDefaultResourceText(input: {name: string; kind: string; apiVersion?: string; namespace?: string}) {
  return `
apiVersion: ${input.apiVersion ? input.apiVersion : 'apps/v1'}
kind: ${input.kind}
metadata:
  name: ${input.name}
  ${input.namespace ? `namespace: ${input.namespace}` : ''}
  `.trim();
}

/**
 * Creates an unsaved Resource which will have it's filePath set as unsaved://resourceId
 */
export function createUnsavedResource(
  input: {name: string; kind: string; apiVersion: string; namespace?: string},
  dispatch: AppDispatch
) {
  // TODO: add logic to use a resource template
  const newResourceId = uuidv4();
  const newResourceText = createDefaultResourceText(input);
  const newResourceContent = parseDocument(newResourceText).toJS();
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
}
