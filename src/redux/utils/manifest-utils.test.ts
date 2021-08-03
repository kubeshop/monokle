import {parseDocument} from 'yaml';
import {mergeManifests, traverseDocument} from '@redux/utils/manifest-utils';

test('manifest-merge-all-match', () => {
  const orgYaml = `apiVersion: v1
kind: ConfigMap
metadata:
  name: agentcom-config
data:
  My: value`;

  const newYaml = `data:
  My: valuechanged
metadata:
  name: agentcom-configdfg
apiVersion: v1
kind: ConfigMap`;

  const expectedYaml = `apiVersion: v1
kind: ConfigMap
metadata:
  name: agentcom-configdfg
data:
  My: valuechanged`;

  const result = mergeManifests(orgYaml, newYaml);
  expect(result).toBe(expectedYaml);
});

test('manifest-merge-remove', () => {
  const orgYaml = `apiVersion: v1
kind: ConfigMap
metadata:
  name: agentcom-config
data:
  My1: value1
  My2: value2
array:
  - 1
  - 2
  - 3`;

  const newYaml = `data:
  My2: valuechanged
metadata:
  name: agentcom-config
array:
  - 1
  - 3
apiVersion: v1
kind: ConfigMap`;

  const expectedYaml = `apiVersion: v1
kind: ConfigMap
metadata:
  name: agentcom-config
data:
  My2: valuechanged
array:
  - 1
  - 3`;

  const result = mergeManifests(orgYaml, newYaml);
  expect(result).toBe(expectedYaml);
});

test('manifest-merge-value-added', () => {
  const orgYaml = `apiVersion: v1
kind: ConfigMap
metadata:
  name: agentcom-config
data:
  My: value`;

  const newYaml = `data:
  My: valuechanged
  My2: valueadded
metadata:
  name: agentcom-config
apiVersion: v1
kind: ConfigMap`;

  const expectedYaml = `apiVersion: v1
kind: ConfigMap
metadata:
  name: agentcom-config
data:
  My: valuechanged
  My2: valueadded`;

  const result = mergeManifests(orgYaml, newYaml);
  expect(result).toBe(expectedYaml);
});

test('manifest-merge-value-added2', () => {
  const orgYaml = `apiVersion: v1
kind: ConfigMap
metadata:
  name: agentcom-config
  namespace: test
data:
  POSTGRES_DB: ""
  REDIS_HOST: ""
  newKey: New Value`;

  const newYaml = `data:
  POSTGRES_DB: ""
  REDIS_HOST: ""
  newKey: New Value
binaryData: {}
metadata:
  annotations: {}
  labels:
    newKey: New Value
  finalizers:
    - test
  name: agentcom-config
  namespace: test
apiVersion: v1
kind: ConfigMap`;

  const expectedYaml = `apiVersion: v1
kind: ConfigMap
metadata:
  name: agentcom-config
  namespace: test
  labels:
    newKey: New Value
  finalizers:
    - test
data:
  POSTGRES_DB: ""
  REDIS_HOST: ""
  newKey: New Value`;

  const result = mergeManifests(orgYaml, newYaml);
  expect(result).toBe(expectedYaml);
});

test('manifest-merge-value-removed2', () => {
  const orgYaml = `apiVersion: v1
kind: ConfigMap
metadata:
  name: agentcom-config
  labels:
    newKey: New Value
immutable: true`;

  const newYaml = `binaryData: {}
metadata:
  annotations: {}
  labels: {}
  name: agentcom-config
apiVersion: v1
kind: ConfigMap
immutable: true`;

  const expectedYaml = `apiVersion: v1
kind: ConfigMap
metadata:
  name: agentcom-config
immutable: true`;

  const result = mergeManifests(orgYaml, newYaml);
  expect(result).toBe(expectedYaml);
});

test.only('traverse-document', () => {
  const inputYaml = `
  apiVersion: v1
  kind: SomeResource
  metadata:
    name: agentcom-config
    namespace: test
    labels:
      newKey: New Value
      app.kubernetes.io/component: test
      app.kubernetes.io/name: test
      app.kubernetes.io/part-of: test
    finalizers:
      - test
      - test2
      - test3: value
      - test4:
        - test5: value
  data:
    POSTGRES_DB: ""
    REDIS_HOST: ""
    newKey: New Value
  spec:
    matchLabels:
      app.kubernetes.io/name: test
      app.kubernetes.io/part-of: test
`;

  const expectedResult = [
    ['apiVersion', 'v1', 'apiVersion', ''],
    ['kind', 'SomeResource', 'kind', ''],
    ['metadata.name', 'agentcom-config', 'name', 'metadata'],
    ['metadata.namespace', 'test', 'namespace', 'metadata'],
    ['metadata.labels.newKey', 'New Value', 'newKey', 'metadata.labels'],
    ['metadata.labels.app.kubernetes.io/component', 'test', 'app.kubernetes.io/component', 'metadata.labels'],
    ['metadata.labels.app.kubernetes.io/name', 'test', 'app.kubernetes.io/name', 'metadata.labels'],
    ['metadata.labels.app.kubernetes.io/part-of', 'test', 'app.kubernetes.io/part-of', 'metadata.labels'],
    ['metadata.finalizers', 'test', 'finalizers', 'metadata'],
    ['metadata.finalizers', 'test2', 'finalizers', 'metadata'],
    ['metadata.finalizers.test3', 'value', 'test3', 'metadata.finalizers'],
    ['metadata.finalizers.test4.test5', 'value', 'test5', 'metadata.finalizers.test4'],
    ['data.POSTGRES_DB', '', 'POSTGRES_DB', 'data'],
    ['data.REDIS_HOST', '', 'REDIS_HOST', 'data'],
    ['data.newKey', 'New Value', 'newKey', 'data'],
    ['spec.matchLabels.app.kubernetes.io/name', 'test', 'app.kubernetes.io/name', 'spec.matchLabels'],
    ['spec.matchLabels.app.kubernetes.io/part-of', 'test', 'app.kubernetes.io/part-of', 'spec.matchLabels'],
  ];

  const result: [string, string, string, string][] = [];
  const document = parseDocument(inputYaml);
  traverseDocument(document, (keyPath, scalar, key, parentKeyPath) => {
    result.push([keyPath, scalar.value as string, key, parentKeyPath]);
  });
  expect(result).toEqual(expectedResult);
});
