import * as React from 'react';
import Form from '@rjsf/bootstrap-4';
import fs from 'fs';
import { useAppSelector } from '../../redux/hooks';

const log = (type: string) => console.log.bind(console, type);
const FormEditor = () => {

  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedResource = useAppSelector(state => state.main.selectedResource);

  const fileContent = fs.readFileSync('schemas/configmap-schema.json', 'utf8');
  const document = JSON.parse(fileContent);
  let data = {};
  if (selectedResource) {
    const resource = resourceMap[selectedResource];
    if (resource) {
      data = resource.content;
    }
  }

  return (
    // @ts-ignore
    <Form schema={document}
          formData={data}
          onChange={log('changed')}
          onSubmit={log('submitted')}
          onError={log('errors')} />
  );
};

export default FormEditor;
