import {ResourceMapType} from '@models/appstate';

import {loadTestResource} from '@redux/services/__test__/utils';

import {extractK8sResources, getNamespaces, getScalarNode, getScalarNodes} from './resource';

test('get-namespaces', () => {
  expect(getNamespaces({}).length).toBe(0);

  const resourceMapWithoutNamespaces: ResourceMapType = {};
  resourceMapWithoutNamespaces['1'] = {
    id: '1',
    filePath: 'folder/filename',
    name: 'resource name',
    kind: 'ResourceType',
    version: '1.0',
    isHighlighted: false,
    isSelected: false,
    content: {},
    text: '',
  };

  expect(getNamespaces(resourceMapWithoutNamespaces).length).toBe(0);

  resourceMapWithoutNamespaces['1'].namespace = 'test';
  expect(getNamespaces(resourceMapWithoutNamespaces).length).toBe(1);

  resourceMapWithoutNamespaces['2'] = {...resourceMapWithoutNamespaces['1']};
  expect(getNamespaces(resourceMapWithoutNamespaces).length).toBe(1);

  resourceMapWithoutNamespaces['3'] = {...resourceMapWithoutNamespaces['1'], namespace: 'test2'};
  expect(getNamespaces(resourceMapWithoutNamespaces).length).toBe(2);
});

test('get-scalar-node', () => {
  const resources = extractTestResources('manifests/core-dns-deployment.yaml');

  expect(resources.length).toBe(1);

  const nameNode = getScalarNode(resources[0], 'metadata:name');
  expect(nameNode).toBeDefined();
  expect(nameNode?.nodeValue()).toBe('coredns');
});

test('get-scalar-nodes', () => {
  const resources = extractTestResources('manifests/argo-rollouts/base/kustomization.yaml');

  expect(resources.length).toBe(1);

  const nameNodes = getScalarNodes(resources[0], 'resources');
  expect(nameNodes).toBeDefined();
  expect(nameNodes?.length).toBe(4);
  // @ts-ignore
  expect(nameNodes[0].nodeValue()).toBe('argo-rollouts-sa.yaml');
});

test('get-scalar-nodes-with-array', () => {
  const resources = extractTestResources('manifests/argo-rollouts/namespace-install/kustomization.yaml');

  expect(resources.length).toBe(1);

  const nameNodes = getScalarNodes(resources[0], 'patchesJson6902:path');
  expect(nameNodes).toBeDefined();
  expect(nameNodes?.length).toBe(2);
  // @ts-ignore
  expect(nameNodes[1].nodeValue()).toBe('clusterrole-to-role.yaml');
});

export function extractTestResources(relativePath: string) {
  const fileContent = loadTestResource(relativePath);
  return extractK8sResources(fileContent, relativePath);
}
