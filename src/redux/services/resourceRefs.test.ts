import {ResourceMapType} from '@models/appstate';

import {getTestResourcePath} from '@redux/services/__test__/utils';
import {readManifests} from '@redux/services/fileEntry.test';
import {isUnsatisfiedRef, processRefs} from '@redux/services/resourceRefs';

test('array-optional-resource-refs', () => {
  const {resourceMap, fileMap, files, helmChartMap, helmValuesMap} = readManifests(
    getTestResourcePath('manifests/arrayOptionalResourceRefs')
  );

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
  const {resourceMap, fileMap, files, helmChartMap, helmValuesMap} = readManifests(
    getTestResourcePath('manifests/resourceRefsWithNamespaces')
  );

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
