import Ajv, {ValidateFunction} from 'ajv';
// @ts-ignore
import log from 'loglevel';
import {Document, LineCounter, ParsedNode, isCollection} from 'yaml';

import {K8sResource, RefPosition} from '@models/k8sresource';

import {isKustomizationPatch} from '@redux/services/kustomize';
import {getLineCounter, getParsedDoc} from '@redux/services/resource';

import {getResourceSchema} from './schema';

/**
 * Validates the specified resource against its JSON Schema and adds validation details
 */

const ignoredProperties = ['lastProbeTime', 'creationTimestamp'];
const validatorCache = new Map<string, ValidateFunction>();

function getErrorPosition(valueNode: ParsedNode, lineCounter: LineCounter | undefined): RefPosition | undefined {
  if (!lineCounter || !valueNode.range) {
    return undefined;
  }

  const linePos = lineCounter.linePos(valueNode.range[0]);
  return {
    line: linePos.line,
    column: linePos.col,
    length: valueNode.range[1] - valueNode.range[0],
  };
}

export function validateResource(resource: K8sResource, schemaVersion: string) {
  if (isKustomizationPatch(resource)) {
    return;
  }

  const resourceSchema = getResourceSchema(resource, schemaVersion);
  if (!resourceSchema) {
    return;
  }

  const validatorCacheKey = resource.kind + resource.version;
  if (!validatorCache.has(validatorCacheKey)) {
    const ajv = new Ajv({
      unknownFormats: 'ignore',
      validateSchema: false,
      logger: false,
      jsonPointers: true,
      verbose: true,
      allErrors: true,
    });
    validatorCache.set(validatorCacheKey, ajv.compile(resourceSchema));
  }

  const validate = validatorCache.get(validatorCacheKey);
  if (validate) {
    try {
      validate(resource.content);
      const errors = [];

      if (validate.errors) {
        errors.push(
          ...validate.errors
            .filter(err => !ignoredProperties.some(ignored => err.dataPath.endsWith(ignored)))
            .map(err => {
              const parsedDoc = getParsedDoc(resource);

              // @ts-ignore
              const valueNode = findJsonPointerNode(parsedDoc, err.dataPath.substring(1).split('/'));

              const error = {
                property: err.dataPath,
                message: err.message || 'message',
                errorPos: valueNode ? getErrorPosition(valueNode, getLineCounter(resource)) : undefined,
                // @ts-ignore
                description: err.parentSchema?.description || undefined,
              };

              // @ts-ignore
              if (err.keyword === 'additionalProperties' && err.params?.additionalProperty) {
                // @ts-ignore
                error.message += `: ${err.params.additionalProperty}`;
              }
              return error;
            })
        );
      }

      // sort errors by line number
      errors.sort((e1, e2): number => {
        if (e1.errorPos && !e2.errorPos) {
          return 1;
        }
        if (!e1.errorPos && e2.errorPos) {
          return -1;
        }
        if (!e1.errorPos && !e2.errorPos) {
          return 0;
        }

        // @ts-ignore
        return e1.errorPos.line - e2.errorPos.line;
      });

      resource.validation = {
        isValid: errors.length === 0,
        errors,
      };
    } catch (e) {
      log.warn('Failed to validate', e);
    }
  }
}

function findJsonPointerNode(valuesDoc: Document.Parsed<ParsedNode>, path: string[]) {
  if (!valuesDoc?.contents) {
    return undefined;
  }

  let valueNode: any = valuesDoc.contents;

  for (let c = 0; valueNode && c < path.length; c += 1) {
    let node = path[c];
    if (isCollection(valueNode)) {
      const nextNode = valueNode.get(node, true);
      if (nextNode) {
        valueNode = nextNode;
      } else {
        return valueNode;
      }
    } else break;
  }

  return valueNode;
}
