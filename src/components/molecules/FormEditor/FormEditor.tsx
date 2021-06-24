import * as React from 'react';
import Form from '@rjsf/bootstrap-4';
import log from 'loglevel';

import {useAppSelector} from '@redux/hooks';
import {getResourceSchema} from '@redux/utils/schema';

const FormEditor = () => {
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedResource = useAppSelector(state => state.main.selectedResource);

  let schema = {};
  let data = {};

  if (selectedResource) {
    const resource = resourceMap[selectedResource];
    if (resource) {
      data = resource.content;
      schema = getResourceSchema(resource) || {};
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
