import {PREDEFINED_K8S_VERSION} from '@constants/constants';

import {getTestResourcePath} from '@redux/services/__test__/utils';
import {readManifests} from '@redux/services/fileEntry.test';
import {validateResource} from '@redux/services/validation';

test('validate-resource', () => {
  const {resourceMap} = readManifests(getTestResourcePath('manifests/invalid-deployment'));

  const resources = Object.values(resourceMap);
  expect(resources.length).toBe(1);
  const deployment = resources.find(r => r.kind === 'Deployment');
  expect(deployment).toBeDefined();
  // @ts-ignore
  validateResource(deployment, PREDEFINED_K8S_VERSION);

  expect(deployment?.validation).toBeDefined();
  expect(deployment?.validation?.errors).toBeDefined();
  expect(deployment?.validation?.errors.length).toBe(4);

  // @ts-ignore
  for (let c = 0; c < deployment.validation.errors.length; c += 1) {
    // @ts-ignore
    const err = deployment.validation?.errors[c];
    // @ts-ignore
    expect(err.errorPos).toBeDefined();

    if (c > 0) {
      // @ts-ignore
      const prevErr = deployment.validation?.errors[c - 1];
      // @ts-ignore
      expect(err.errorPos.line >= prevErr.errorPos.line).toBeTruthy();
    }
  }
});
