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
  expect(resources.length).toBe(3);
  const deployment = resources.find(r => r.kind === 'Deployment');
  expect(deployment).toBeDefined();

  processRefs(resourceMap, {shouldIgnoreOptionalUnsatisfiedRefs: true});

  // @ts-ignore
  expect(deployment.refs?.length).toBe(2);
  // @ts-ignore
  expect(deployment.refs?.filter(ref => isUnsatisfiedRef(ref.type)).length).toBe(1);
});
