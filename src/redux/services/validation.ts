import Ajv, {ValidateFunction} from 'ajv';
import log from 'loglevel';

import {isKustomizationPatch} from '@redux/services/kustomize';

import {K8sResource} from '@models/k8sresource';

import {getResourceSchema} from './schema';

/**
 * Validates the specified resource against its JSON Schema and adds validation details
 */

const ignoredProperties = ['lastProbeTime', 'creationTimestamp'];
const validatorCache = new Map<string, ValidateFunction>();

export function validateResource(resource: K8sResource) {
  if (isKustomizationPatch(resource)) {
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
      validate(resource.content);
      const errors = validate.errors
        ? validate.errors
            .filter(err => !ignoredProperties.some(ignored => err.dataPath.endsWith(ignored)))
            .map(err => {
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
        : [];

      resource.validation = {
        isValid: errors.length === 0,
        errors,
      };
    } catch (e) {
      log.warn('Failed to validate', e);
    }
  }
}
