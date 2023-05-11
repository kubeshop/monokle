import {parseYamlDocument, stringifyK8sResource} from '@utils/yaml';

test('handle octal values in schema', () => {
  let yaml =
    'kind: Deployment\n' +
    'spec:\n' +
    '  template:\n' +
    '    spec:\n' +
    '      volumes:\n' +
    '        - secret:\n' +
    '            defaultMode: 0644\n';

  let obj = parseYamlDocument(yaml).toJS();
  expect(stringifyK8sResource(obj)).toEqual(yaml);
});
