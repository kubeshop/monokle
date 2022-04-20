import Ajv, {ValidateFunction} from 'ajv';
import {get} from 'lodash';
import {Document, LineCounter, Node, ParsedNode, isCollection, isNode} from 'yaml';

import {K8sResource, RefPosition, ResourceValidationError} from '@models/k8sresource';
import {POLICY_VALIDATOR_MAP, Policy, SarifRule} from '@models/policy';

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

export function validatePolicies(resource: K8sResource, policies: Policy[]): ResourceValidationError[] {
  const allErrors = policies
    .filter(policy => policy.config.enabled && policy.validatorId)
    .flatMap(policy => {
      return policy.metadata.rules.flatMap(rule => {
        const errors = validatePolicyRule(resource, policy, rule);
        return errors;
      });
    });

  return allErrors;
}

function validatePolicyRule(resource: K8sResource, policy: Policy, rule: SarifRule): ResourceValidationError[] {
  const validator = POLICY_VALIDATOR_MAP[policy.validatorId!];
  const evaluation = validator.evaluate(resource.content, rule.properties.entrypoint);
  const violations = evaluation[0]?.result ?? [];
  const errors = violations.map((err: {msg?: string}): ResourceValidationError => {
    // Needs a better generic solution
    const regexMatch = err.msg?.match(/Container '([A-Za-z-]*)'/);
    const container = regexMatch ? regexMatch[1] : undefined;
    const message = container
      ? `${rule.shortDescription.text} on container "${container}"`
      : rule.shortDescription.text;

    const pathHint = rule.properties.path;
    const errorPos = container
      ? determineContainerErrorPos(resource, container, pathHint)
      : {column: 1, length: 10, line: 1};

    return {
      message,
      description: `${rule.longDescription.text} ${rule.help.text}`,
      property: rule.id,
      errorPos,
      rule,
    };
  });

  return errors;
}

type YamlPath = Array<string | number>;

function determineContainerErrorPos(resource: K8sResource, container: string, pathHint?: string): RefPosition {
  const prefix = determineContainerPrefix(resource, container);

  if (!prefix.length) {
    return {line: 1, column: 1, length: 10};
  }

  const lineCounter = getLineCounter(resource);
  const node = determineClosestErrorNode(resource, prefix, pathHint);

  if (!lineCounter || !node || !node.range) {
    return {line: 1, column: 1, length: 1};
  }
  const start = lineCounter.linePos(node.range[0]);
  const end = lineCounter.linePos(node.range[1]);
  const length = node.range[1] - node.range[0];

  return {line: start.line, column: start.col, length, endLine: end.line, endColumn: end.col};
}

const CONTROLLER_KINDS = ['Deployment', 'StatefulSet', 'Job', 'DaemonSet', 'ReplicaSet', 'ReplicationController'];

function determineContainerPrefix(resource: K8sResource, container: string): YamlPath {
  if (CONTROLLER_KINDS.includes(resource.kind)) {
    const prefix: YamlPath = ['spec', 'template', 'spec'];
    const containerIndex = determineContainerIndex(resource, container, prefix, ['initContainers', 'containers']);
    return prefix.concat(containerIndex);
  }
  if (resource.kind === 'CronJob') {
    const prefix: YamlPath = ['spec', 'jobTemplate', 'spec', 'template', 'spec'];
    const containerIndex = determineContainerIndex(resource, container, prefix, ['containers']);
    return prefix.concat(containerIndex);
  }
  if (resource.kind === 'Pod') {
    const prefix: YamlPath = ['spec'];
    const containerIndex = determineContainerIndex(resource, container, prefix, ['containers']);
    return prefix.concat(containerIndex);
  }
  return [];
}

function determineContainerIndex(
  resource: K8sResource,
  container: string,
  prefix: YamlPath,
  properties: string[]
): YamlPath {
  for (let i = 0; i < properties.length; i += 1) {
    const property = properties[i];
    const containers: {name: string}[] = get(resource.content, prefix.concat(property), []);
    const containerIndex = containers.findIndex(c => c.name === container);
    if (containerIndex !== -1) {
      return [property, containerIndex];
    }
  }
  return [];
}

/**
 * Use a path hint to determine the node of the error or closest parent.
 *
 * Example:
 * - Hint: $container.securityContext.readOnlyRootFilesystem and desired value is `true`.
 * - When $container specifies `securityContext.readOnlyRootFilesystem` then it underlines the incorrect `false` value.
 * - When $container specifies `securityContext` then it underlines whole context object.
 * - When $container does not specify `securityContext` then it underlines whole container object.
 */
function determineClosestErrorNode(resource: K8sResource, prefix: YamlPath, pathHint?: string): Node | undefined {
  const doc = getParsedDoc(resource);
  const [head, ...tail] = pathHint?.split('.') ?? [];

  if (!head || head !== '$container') {
    const node = doc.getIn(prefix, true);
    return isNode(node) ? node : undefined;
  }

  const path = prefix.concat(tail);
  while (path.length > prefix.length) {
    const node = doc.getIn(path, true);

    if (isNode(node)) {
      return node;
    }

    path.pop();
  }

  const node = doc.getIn(path, true);
  return isNode(node) ? node : undefined;
}

export function validateResource(resource: K8sResource, schemaVersion: string, userDataDir: string) {
  if (isKustomizationPatch(resource)) {
    return;
  }

  const errors = [];
  const validate = lazyGetResourceValidator(resource, schemaVersion, userDataDir);

  if (!validate) {
    resource.validation = {
      isValid: false,
      errors: [{property: '', message: 'Native K8s schema not found!'}],
    };
    return;
  }

  // parse for YAML errors that were allowed by non-strict parsing
  const doc = getParsedDoc(resource, {forceParse: true});
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

  // parse for schema errors
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

  errors.sort(compareErrorsByLineNumber);

  resource.validation = {
    isValid: errors.length === 0,
    errors,
  };
}

function lazyGetResourceValidator(
  resource: K8sResource,
  schemaVersion: string,
  userDataDir: string
): Ajv.ValidateFunction | undefined {
  const resourceSchema = getResourceSchema(resource, schemaVersion, userDataDir);

  if (!resourceSchema) {
    return undefined;
  }

  const validatorCacheKey = `${schemaVersion}-${resource.kind}-${resource.version}`;

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

  return validatorCache.get(validatorCacheKey);
}

function compareErrorsByLineNumber(e1: ResourceValidationError, e2: ResourceValidationError): number {
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
