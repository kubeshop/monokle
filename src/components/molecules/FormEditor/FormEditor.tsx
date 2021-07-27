import * as React from 'react';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {withTheme} from '@rjsf/core';
// @ts-ignore
import {Theme as AntDTheme} from '@rjsf/antd';
import {loadResource} from '@redux/utils';
import {useEffect} from 'react';
import {updateResource} from '@redux/reducers/main';
import {logMessage} from '@redux/utils/log';
import {parse, stringify} from 'yaml';
import {mergeManifests} from '@redux/utils/manifest-utils';
import styled from 'styled-components';

const Form = withTheme(AntDTheme);

function getFormSchema(kind: string) {
  return JSON.parse(loadResource(`form-schemas/${kind.toLowerCase()}-schema.json`));
}

function getUiSchema(kind: string) {
  return JSON.parse(loadResource(`form-schemas/${kind.toLowerCase()}-ui-schema.json`));
}

const FormContainer = styled.div<{contentHeight: string}>`
  width: 100%;
  padding: 20px;
  margin: 0px;
  margin-bottom: 20px;
  overflow-y: scroll;
  height: ${props => props.contentHeight};
  padding-bottom: 100px;

  ::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }

  .ant-form-item-label {
    font-weight: bold;
  }
`;

const FormEditor = (props: {contentHeight: string}) => {
  const {contentHeight} = props;
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedResource = useAppSelector(state => state.main.selectedResource);
  const [formData, setFormData] = React.useState(null);
  const dispatch = useAppDispatch();
  const resource = resourceMap && selectedResource ? resourceMap[selectedResource] : undefined;

  useEffect(() => {
    if (resource) {
      setFormData(parse(resource.text));
    }
  }, [resource]);

  if (!selectedResource) {
    return <div>Nothing selected...</div>;
  }

  const onFormUpdate = (e: any) => {
    setFormData(e.formData);
  };

  const onFormSubmit = (data: any, e: any) => {
    let formString = stringify(data.formData);
    try {
      if (resource) {
        const content = mergeManifests(resource.text, formString);
/*
        log.debug(resource.text);
        log.debug(formString);
        log.debug(content);
*/
        dispatch(updateResource({resourceId: selectedResource, content}));
      }
    } catch (err) {
      logMessage(`Failed to update resource ${err}`, dispatch);
    }
  };

  if (resource?.kind !== 'ConfigMap') {
    return <div>Form editor only for ConfigMap resources...</div>;
  }

  let schema = getFormSchema(resource.kind);
  let uiSchema = getUiSchema(resource.kind);

  return (
    // @ts-ignore
    <FormContainer contentHeight={contentHeight}>
      <Form schema={schema} uiSchema={uiSchema} formData={formData} onChange={onFormUpdate} onSubmit={onFormSubmit} />
    </FormContainer>
  );
};

export default FormEditor;
