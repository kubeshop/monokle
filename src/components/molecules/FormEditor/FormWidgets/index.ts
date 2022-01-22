import {ApiGroupSelection} from './ApiGroupSelection';
import {NamespaceSelection} from './NamespaceSelection';
import {ResourceSelection} from './ResourceSelection';
import {SecretKindResourceForm} from './SecretKindResourceForm';
import {SecretKindSelection} from './SecretKindSelection';

export function getCustomFormWidgets() {
  return {
    namespaceSelection: NamespaceSelection,
    resourceSelection: ResourceSelection,
    apiGroupSelection: ApiGroupSelection,
  };
}

export function getCustomFormFields() {
  return {
    secretKindSelection: SecretKindSelection,
    secretKindForm: SecretKindResourceForm,
  };
}
