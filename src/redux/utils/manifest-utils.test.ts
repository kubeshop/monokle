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

test('traverse-document', () => {
  const inputYaml = `
  apiVersion: v1
  kind: ConfigMap
  metadata:
    name: agentcom-config
    namespace: test
    labels:
      newKey: New Value
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
`;
  const expectedResult = [
    ['apiVersion', 'v1', ''],
    ['kind', 'ConfigMap', ''],
    ['name', 'agentcom-config', 'metadata'],
    ['namespace', 'test', 'metadata'],
    ['newKey', 'New Value', 'metadata.labels'],
    ['finalizers', 'test', 'metadata'],
    ['finalizers', 'test2', 'metadata'],
    ['test3', 'value', 'metadata.finalizers'],
    ['test5', 'value', 'metadata.finalizers.test4'],
    ['POSTGRES_DB', '', 'data'],
    ['REDIS_HOST', '', 'data'],
    ['newKey', 'New Value', 'data'],
  ];

  const result: [string, string | null, string | null][] = [];
  const document = parseDocument(inputYaml);
  traverseDocument(document, (key, scalarValue, parentKey) => {
    result.push([key, scalarValue.value as string, parentKey]);
  });
  expect(result).toEqual(expectedResult);
});
