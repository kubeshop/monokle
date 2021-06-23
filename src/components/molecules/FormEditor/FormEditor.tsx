import * as React from 'react';
import Form from '@rjsf/bootstrap-4';
import fs from 'fs';
import log from 'loglevel';

import {getStaticResourcePath} from '@redux/utils/fileEntry';
import {useAppSelector} from '@redux/hooks';

const FormEditor = () => {
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedResource = useAppSelector(state => state.main.selectedResource);

  let schema = {};
  let data = {};

  try {
    const filePath = getStaticResourcePath('schemas/configmap-schema.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    schema = JSON.parse(fileContent);
  } catch (e) {
    log.error(e);
  }

  if (selectedResource) {
    const resource = resourceMap[selectedResource];
    if (resource) {
      data = resource.content;
    }
  }

  return (
    // @ts-ignore
    <Form
      schema={schema}
      formData={data}
      onChange={log.debug('changed')}
      onSubmit={log.debug('submitted')}
      onError={log.debug('errors')}
    />
  );
};

export default FormEditor;
