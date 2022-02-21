import Ajv, {ValidateFunction} from 'ajv';
// @ts-ignore
import log from 'loglevel';
import {Document, LineCounter, ParsedNode, isCollection, parseDocument} from 'yaml';

import {K8sResource, RefPosition, ResourceValidationError} from '@models/k8sresource';

import {isKustomizationPatch} from '@redux/services/kustomize';
import {getLineCounter, getParsedDoc} from '@redux/services/resource';

import {getResourceSchema} from './schema';

/**
 * Validates the specified resource against its JSON Schema and adds validation details
 * This overlaps with CLUSTER_RESOURCE_IGNORED_PATHS and should probably be moved into corresponding
 * kindHandlers
 */

const ignoredProperties = [
  '*lastProbeTime',
  '*creationTimestamp',
  '*finishedAt',
  '*createdAt',
  '*startedAt',
  '*x_kubernetes_preserve_unknown_fields',
  '/metadata/resourceVersion*',
  '/metadata/selfLink*',
  '/metadata/uid*',
  '/metadata/generation*',
  '/status*',
];
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

export function validateResource(resource: K8sResource) {
  if (isKustomizationPatch(resource)) {
    return;
  }

  const resourceSchema = getResourceSchema(resource);
  if (!resourceSchema) {
    return;
  }

  const errors = [];

  // parse for YAML errors that were allowed by non-strict parsing
  const doc = parseDocument(resource.text);
  if (doc.errors.length > 0) {
    const lines = resource.text.split('\n');
    if (lines[0] === '---') {
      lines.shift();
    }

    errors.push(
      ...doc.errors.map(err => {
        const line = err.linePos ? lines[err.linePos[0].line].trim() : '';
        const error: ResourceValidationError = {
          property: err.name,
          message: err.code,
          description: err.message,
          errorPos: {
            line: err.linePos && err.linePos.length > 0 && err.linePos[0].line ? err.linePos[0].line : 0,
            column: err.linePos && err.linePos.length > 0 && err.linePos[0].col ? err.linePos[0].col : 0,
            length: line.length,
          },
        };

        return error;
      })
    );
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

      if (validate.errors) {
        errors.push(
          ...validate.errors
            .filter(
              err =>
                !ignoredProperties.some(
                  ignored =>
                    (ignored.startsWith('*') && err.dataPath.endsWith(ignored.substring(1))) ||
                    (ignored.endsWith('*') && err.dataPath.startsWith(ignored.substring(0, ignored.length - 1))) ||
                    err.dataPath === ignored
                )
            )
            .map(err => {
              const parsedDoc = getParsedDoc(resource);

              // @ts-ignore
              const valueNode = findJsonPointerNode(parsedDoc, err.dataPath.substring(1).split('/'));

              const error: ResourceValidationError = {
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
    } catch (e) {
      log.warn('Failed to validate', e);
    }
  }

  resource.validation = {
    isValid: errors.length === 0,
    errors,
  };
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
