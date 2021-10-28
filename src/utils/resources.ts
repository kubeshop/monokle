import {K8sResource} from '@models/k8sresource';

export const makeResourceNameKindNamespaceIdentifier = (resource: K8sResource) =>
  `${resource.name}#${resource.kind}#${resource.namespace ? resource.namespace : 'default'}`;
