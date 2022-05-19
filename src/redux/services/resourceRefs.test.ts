import {ResourceMapType} from '@models/appstate';

import {getTestResourcePath} from '@redux/services/__test__/utils';
import {readManifests} from '@redux/services/fileEntry.test';
import {isOutgoingRef, isUnsatisfiedRef, processRefs} from '@redux/services/resourceRefs';

import {awaitKindHandlersLoading} from '@src/kindhandlers';

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

test('custom-resource-refs', async () => {
  await awaitKindHandlersLoading;

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
}, 30000);

test('sibling-matchers', () => {
  const {resourceMap} = readManifests(getTestResourcePath('manifests/siblingMatchers'));

  const resources = Object.values(resourceMap);
  expect(resources.length).toBe(3);
  const crb = findResourceByName(resourceMap, 'argocd-application-controller-cluster-role-binding');
  expect(crb).toBeDefined();

  processRefs(resourceMap, {shouldIgnoreOptionalUnsatisfiedRefs: false});

  // @ts-ignore
  expect(crb.refs?.length).toBe(2);

  // @ts-ignore
  expect(isUnsatisfiedRef(crb.refs[0].type)).toBe(true);

  // @ts-ignore
  expect(isOutgoingRef(crb.refs[1].type)).toBe(true);
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

test('pair-refs', () => {
  const {resourceMap} = readManifests(getTestResourcePath('manifests/pairRefs'));

  const resources = Object.values(resourceMap);
  expect(resources.length).toBe(2);
  const service = findResourceByName(resourceMap, 'argo-rollouts-dashboard');
  expect(service).toBeDefined();

  processRefs(resourceMap, {shouldIgnoreOptionalUnsatisfiedRefs: false});

  // @ts-ignore
  expect(service.refs?.length).toBe(1);
  // @ts-ignore
  expect(isOutgoingRef(service.refs[0].type)).toBe(true);
});

test('configurable-group-matcher', async () => {
  await awaitKindHandlersLoading;

  const {resourceMap} = readManifests(getTestResourcePath('manifests/issuerRefs'));

  const resources = Object.values(resourceMap);
  expect(resources.length).toBe(2);

  const certificateRequest = findResourceByName(resourceMap, 'testkube-operator-serving-cert-fbtng');
  expect(certificateRequest).toBeDefined();

  processRefs(resourceMap, {shouldIgnoreOptionalUnsatisfiedRefs: false});

  // @ts-ignore
  expect(certificateRequest.refs?.length).toBe(1);
  // @ts-ignore
  expect(isOutgoingRef(certificateRequest.refs[0].type)).toBe(true);
});
