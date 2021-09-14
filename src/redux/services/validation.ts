import {K8sResource} from '@models/k8sresource';
import log from 'loglevel';
import Ajv, {ValidateFunction} from 'ajv';
import {getResourceSchema} from './schema';

/**
 * Validates the specified resource against its JSON Schema and adds validation details
 */

const validatorCache = new Map<string, ValidateFunction>();

export function validateResource(resource: K8sResource) {
  if (resource.name.startsWith('Patch: ')) {
    return;
  }

  const resourceSchema = getResourceSchema(resource);
  if (!resourceSchema) {
    return;
  }

  if (!validatorCache.has(resource.kind)) {
    const ajv = new Ajv({unknownFormats: 'ignore', validateSchema: false, logger: false});
    validatorCache.set(resource.kind, ajv.compile(resourceSchema));
  }

  const validate = validatorCache.get(resource.kind);
  if (validate) {
    try {
      const validationResult = validate(resource.content);
      resource.validation = {
        isValid: Boolean(validationResult),
        errors: validate.errors
          ? validate.errors.map(err => {
              const error = {
                property: err.dataPath,
                message: err.message || 'message',
              };

              // @ts-ignore
              if (err.keyword === 'additionalProperties' && err.params?.additionalProperty) {
                // @ts-ignore
                error.message += `: ${err.params.additionalProperty}`;
              }
              return error;
            })
          : [],
      };
    } catch (e) {
      log.warn('Failed to validate', e);
    }
  }
}
