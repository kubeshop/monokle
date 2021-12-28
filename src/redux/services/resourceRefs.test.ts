import {ResourceMapType} from '@models/appstate';

import {getTestResourcePath} from '@redux/services/__test__/utils';
import {readManifests} from '@redux/services/fileEntry.test';
import {isOutgoingRef, isUnsatisfiedRef, processRefs} from '@redux/services/resourceRefs';

test('array-optional-resource-refs', () => {
  const {resourceMap} = readManifests(getTestResourcePath('manifests/arrayOptionalResourceRefs'));

  const resources = Object.values(resourceMap);
  expect(resources.length).toBe(2);
  const deployment = resources.find(r => r.kind === 'Deployment');
  expect(deployment).toBeDefined();

  processRefs(resourceMap, {shouldIgnoreOptionalUnsatisfiedRefs: false});

  // @ts-ignore
  expect(deployment.refs?.length).toBe(4);
  // @ts-ignore
  expect(deployment.refs?.filter(ref => isUnsatisfiedRef(ref.type)).length).toBe(2);

  processRefs(resourceMap, {shouldIgnoreOptionalUnsatisfiedRefs: true});

  // @ts-ignore
  expect(deployment.refs?.length).toBe(3);
  // @ts-ignore
  expect(deployment.refs?.filter(ref => isUnsatisfiedRef(ref.type)).length).toBe(1);
});

test('namespaced-resource-refs', () => {
  const {resourceMap} = readManifests(getTestResourcePath('manifests/resourceRefsWithNamespaces'));

  const resources = Object.values(resourceMap);
  expect(resources.length).toBe(5);
  const deployment = findResourceByName(resourceMap, 'argocd-repo-server');
  expect(deployment).toBeDefined();

  processRefs(resourceMap, {shouldIgnoreOptionalUnsatisfiedRefs: true});

  // @ts-ignore
  expect(deployment.refs?.length).toBe(2);
  // @ts-ignore
  expect(deployment.refs?.filter(ref => isUnsatisfiedRef(ref.type)).length).toBe(1);

  const pv = findResourceByName(resourceMap, 'persistent-volume-2');
  expect(pv).toBeDefined();

  // @ts-ignore
  expect(pv.refs?.length).toBe(3);
  // @ts-ignore
  expect(pv.refs?.filter(ref => isUnsatisfiedRef(ref.type)).length).toBe(2);
});

function findResourceByName(resourceMap: ResourceMapType, name: string) {
  return Object.values(resourceMap).find(r => r.name === name);
}

test('custom-resource-refs', () => {
  const {resourceMap} = readManifests(getTestResourcePath('manifests/istio'));

  const resources = Object.values(resourceMap);
  expect(resources.length).toBe(2);
  const virtualService = findResourceByName(resourceMap, 'bookinfo');
  expect(virtualService).toBeDefined();

  processRefs(resourceMap, {shouldIgnoreOptionalUnsatisfiedRefs: false});

  // @ts-ignore
  expect(virtualService.refs?.length).toBe(1);
  // @ts-ignore
  expect(isOutgoingRef(virtualService.refs[0].type)).toBe(true);

  const gateway = findResourceByName(resourceMap, 'bookinfo-gateway');
  expect(gateway).toBeDefined();

  // @ts-ignore
  expect(gateway.refs?.length).toBe(2);
  // @ts-ignore
  expect(gateway.refs?.filter(ref => isUnsatisfiedRef(ref.type)).length).toBe(1);
});

test('networkpolicy-resource-refs', () => {
  const {resourceMap} = readManifests(getTestResourcePath('manifests/networkpolicy'));

  const resources = Object.values(resourceMap);
  expect(resources.length).toBe(1);
  const networkPolicy = findResourceByName(resourceMap, 'argocd-dex-server-network-policy');
  expect(networkPolicy).toBeDefined();

  processRefs(resourceMap, {shouldIgnoreOptionalUnsatisfiedRefs: false});

  // @ts-ignore
  expect(networkPolicy.refs?.length).toBe(1);
  // @ts-ignore
  expect(isUnsatisfiedRef(networkPolicy.refs[0].type)).toBe(true);
});
