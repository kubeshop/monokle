import {parseDocument} from 'yaml';

import {loadTestResource} from '@redux/services/__test__/utils';
import {removeSchemaDefaults} from '@redux/services/schema';

test('test-remove-defaults', () => {
  const schema = parseDocument(loadTestResource('schemas/flux-kustomization-schema.yaml')).toJS();

  expect(schema.properties.status.default).toBeDefined();
  expect(schema.properties.spec.properties.force.default).toBeDefined();
  expect(schema.properties.spec.properties.dependsOn.items.properties.namespace.default).toBeDefined();

  const newSchema = removeSchemaDefaults(schema, true, true);

  expect(newSchema.properties.status.default).toBeUndefined();
  expect(newSchema.properties.spec.properties.force.default).toBeUndefined();
  expect(newSchema.properties.spec.properties.dependsOn.items.properties.namespace.default).toBeUndefined();

  expect(schema.properties.status.default).toBeDefined();
  expect(schema.properties.spec.properties.force.default).toBeDefined();
  expect(schema.properties.spec.properties.dependsOn.items.properties.namespace.default).toBeDefined();

  const newSchema2 = removeSchemaDefaults(schema, true, false);

  expect(newSchema2.properties.status.default).toBeUndefined();
  expect(newSchema2.properties.spec.properties.force.default).toBeDefined();
  expect(newSchema2.properties.spec.properties.dependsOn.items.properties.namespace.default).toBeDefined();

  const newSchema3 = removeSchemaDefaults(schema, false, true);

  expect(newSchema3.properties.status.default).toBeDefined();
  expect(newSchema3.properties.spec.properties.force.default).toBeUndefined();
  expect(newSchema3.properties.spec.properties.dependsOn.items.properties.namespace.default).toBeUndefined();
});
