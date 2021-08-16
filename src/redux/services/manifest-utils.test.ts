import {parseDocument} from 'yaml';
import {mergeManifests, traverseDocument} from '@redux/services/manifest-utils';

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
  expect(result).toEqual(expectedYaml);
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
  expect(result).toEqual(expectedYaml);
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
  expect(result).toEqual(expectedYaml);
});

test('manifest-array-removed', () => {
  const orgYaml = `apiVersion: v1
kind: ConfigMap
metadata:
  name: argo-rollouts-notification-configmap
  namespace: test
  finalizers:
    - test
immutable: false`;

  const newYaml = `data: {}
binaryData: {}
metadata:
  annotations: {}
  labels: {}
  finalizers: []
  name: argo-rollouts-notification-configmap
  namespace: test
apiVersion: v1
kind: ConfigMap
immutable: false`;

  const expectedYaml = `apiVersion: v1
kind: ConfigMap
metadata:
  name: argo-rollouts-notification-configmap
  namespace: test
immutable: false`;

  const result = mergeManifests(orgYaml, newYaml);
  expect(result).toEqual(expectedYaml);
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
  expect(result).toEqual(expectedYaml);
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
  expect(result).toEqual(expectedYaml);
});

test('traverse-document', () => {
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
    [[], ['apiVersion'], 'apiVersion', 'v1'],
    [[], ['kind'], 'kind', 'SomeResource'],
    [['metadata'], ['metadata', 'name'], 'name', 'agentcom-config'],
    [['metadata'], ['metadata', 'namespace'], 'namespace', 'test'],
    [['metadata', 'labels'], ['metadata', 'labels', 'newKey'], 'newKey', 'New Value'],
    [
      ['metadata', 'labels'],
      ['metadata', 'labels', 'app.kubernetes.io/component'],
      'app.kubernetes.io/component',
      'test',
    ],
    [['metadata', 'labels'], ['metadata', 'labels', 'app.kubernetes.io/name'], 'app.kubernetes.io/name', 'test'],
    [['metadata', 'labels'], ['metadata', 'labels', 'app.kubernetes.io/part-of'], 'app.kubernetes.io/part-of', 'test'],
    [['metadata'], ['metadata', 'finalizers'], 'finalizers', 'test'],
    [['metadata'], ['metadata', 'finalizers'], 'finalizers', 'test2'],
    [['metadata', 'finalizers'], ['metadata', 'finalizers', 'test3'], 'test3', 'value'],
    [['metadata', 'finalizers', 'test4'], ['metadata', 'finalizers', 'test4', 'test5'], 'test5', 'value'],
    [['data'], ['data', 'POSTGRES_DB'], 'POSTGRES_DB', ''],
    [['data'], ['data', 'REDIS_HOST'], 'REDIS_HOST', ''],
    [['data'], ['data', 'newKey'], 'newKey', 'New Value'],
    [['spec', 'matchLabels'], ['spec', 'matchLabels', 'app.kubernetes.io/name'], 'app.kubernetes.io/name', 'test'],
    [
      ['spec', 'matchLabels'],
      ['spec', 'matchLabels', 'app.kubernetes.io/part-of'],
      'app.kubernetes.io/part-of',
      'test',
    ],
  ];

  const result: [string[], string[], string, string][] = [];
  const document = parseDocument(inputYaml);
  traverseDocument(document, (parentKeyPathParts, keyPathParts, key, scalar) => {
    result.push([parentKeyPathParts, keyPathParts, key, scalar.value as string]);
  });
  expect(result).toEqual(expectedResult);
});
