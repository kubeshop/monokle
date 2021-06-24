import {isKustomizationResource} from '@redux/utils/resource';
import {loadResource} from '@redux/utils/fileEntry';
import {K8sResource} from '@models/k8sresource';

export function getResourceSchema(resource: K8sResource) {
  if (isKustomizationResource(resource)) {
    const kustomizeSchema = loadResource('schemas/kustomization.json');
    return JSON.parse(kustomizeSchema);
  }
  const k8sSchemas = loadResource('schemas/k8sschemas.json');
  const k8sSchema = JSON.parse(k8sSchemas);

  // @ts-ignore
  let kindSchema = k8sSchema['definitions'][`io.k8s.api.apps.v1.${resource.kind}`];
  if (!kindSchema) {
    kindSchema = k8sSchema['definitions'][`io.k8s.api.core.v1.${resource.kind}`];
  }

  if (kindSchema) {
    Object.keys(kindSchema).forEach(key => {
      k8sSchema[key] = kindSchema[key];
    });
    return k8sSchema;
  }

  return undefined;
}
