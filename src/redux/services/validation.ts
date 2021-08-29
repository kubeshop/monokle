import {validate} from 'json-schema';
import {K8sResource} from '@models/k8sresource';
import {getResourceSchema} from './schema';

export function validateResource(resource: K8sResource) {
  const resourceSchema = getResourceSchema(resource);
  if (!resourceSchema) {
    return;
  }
  const validationResult = validate(resource.content, resourceSchema);
  resource.validation = {
    isValid: validationResult.valid,
    errors: validationResult.errors.map(err => ({
      property: err.property,
      message: err.message,
    })),
  };
}
