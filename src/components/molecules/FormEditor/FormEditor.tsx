import React, {useCallback, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {useDebounce} from 'react-use';
import styled from 'styled-components';
import {stringify} from 'yaml';

import {useAppDispatch} from '@redux/hooks';
import {updateResource} from '@redux/reducers/main';
import {isInPreviewModeSelector, selectedResourceSelector} from '@redux/selectors';
import {loadResource} from '@redux/services';
import {logMessage} from '@redux/services/log';
import {mergeManifests} from '@redux/services/manifest-utils';

// @ts-ignore
import {Theme as AntDTheme} from '@rjsf/antd';
import {withTheme} from '@rjsf/core';
import isDeepEqual from 'fast-deep-equal/es6/react';

const Form = withTheme(AntDTheme);

/**
 * Load schemas every time for now - should be cached in the future...
 */

const formSchemaCache = new Map<string, any>();
const uiformSchemaCache = new Map<string, any>();

function getFormSchema(kind: string) {
  try {
    if (!formSchemaCache.has(kind)) {
      formSchemaCache.set(kind, JSON.parse(loadResource(`form-schemas/${kind.toLowerCase()}-schema.json`)));
    }

    return formSchemaCache.get(kind);
  } catch (error) {
    return undefined;
  }
}

function getUiSchema(kind: string) {
  try {
    if (!uiformSchemaCache.has(kind)) {
      uiformSchemaCache.set(kind, JSON.parse(loadResource(`form-schemas/${kind.toLowerCase()}-ui-schema.json`)));
    }

    return uiformSchemaCache.get(kind);
  } catch (error) {
    return undefined;
  }
}

const FormContainer = styled.div<{contentHeight: string}>`
  width: 100%;
  padding-left: 15px;
  padding-right: 8px;
  margin: 0px;
  margin-top: 20px;
  margin-bottom: 20px;
  overflow-y: scroll;
  height: ${props => props.contentHeight};
  padding-bottom: 100px;

  ::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }

  .ant-input[disabled] {
    color: grey;
  }

  .ant-checkbox-disabled + span {
    color: grey;
  }

  .ant-form-item-label {
    font-weight: bold;
    padding-top: 10px;
    padding-bottom: 0px;
  }

  .ant-form-item-explain {
    color: lightgrey;
    font-size: 12px;
    margin-top: 5px;
  }

  .object-property-expand {
    background: black;
    color: #177ddc;
    width: 120px;
    margin-left: 50px;
  }

  .array-item-add {
    background: black;
    color: #177ddc;
    width: 120px;
    margin-left: 50px;
  }

  .array-item-remove {
    background: black;
    color: #177ddc;
    width: 120px;
    margin-left: 50px;
    margin-top: 42px;
  }

  .array-item-move-up {
    background: black;
    color: #177ddc;
    width: 120px;
    margin-left: 50px;
  }

  .array-item-move-down {
    background: black;
    color: #177ddc;
    width: 120px;
    margin-left: 50px;
  }

  .ant-btn-dangerous {
    background: black;
    color: #177ddc;
    margin-left: 50px;
  }

  .field-object {
    margin-top: -10px;
  }
  .field-string {
    margin-bottom: -10px;
  }
`;

const FormEditor = (props: {contentHeight: string; type: string}) => {
  const {contentHeight, type} = props;
  const selectedResource = useSelector(selectedResourceSelector);
  const [formData, setFormData] = useState<{
    currFormData: any;
    orgFormData: any;
  }>({currFormData: undefined, orgFormData: undefined});
  const [hasChanged, setHasChanged] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const isInPreviewMode = useSelector(isInPreviewModeSelector);

  let schema;
  let uiSchema;

  if (type === 'metadata') {
    schema = selectedResource && getFormSchema(type);
    uiSchema = selectedResource && getUiSchema(type);
  } else {
    schema = selectedResource && getFormSchema(selectedResource.kind);
    uiSchema = selectedResource && getUiSchema(selectedResource.kind);
  }

  const onFormUpdate = useCallback(
    (e: any) => {
      if (e.formData === undefined) {
        return;
      }
      if (formData.orgFormData) {
        setFormData({currFormData: e.formData, orgFormData: formData.orgFormData});
        setHasChanged(!isDeepEqual(e.formData, formData.orgFormData));
      } else {
        setFormData({currFormData: e.formData, orgFormData: e.formData});
        setHasChanged(false);
      }
    },
    [formData]
  );

  const onFormSubmit = useCallback(
    (data: any, e: any) => {
      try {
        if (selectedResource) {
          let formString = stringify(data);
          const content = mergeManifests(selectedResource.text, formString);

          /* log.debug(resource.text);
          log.debug(formString);
          log.debug(content); */

          setHasChanged(false);
          dispatch(updateResource({resourceId: selectedResource.id, content}));
        }
      } catch (err) {
        logMessage(`Failed to update resource ${err}`, dispatch);
      }
    },
    [selectedResource, dispatch]
  );

  const submitForm = useCallback(() => {
    if (formData) {
      onFormSubmit(formData.currFormData, null);
    }
  }, [formData, onFormSubmit]);

  useDebounce(
    () => {
      if (hasChanged) {
        submitForm();
      }
    },
    250,
    [hasChanged]
  );

  useEffect(() => {
    if (selectedResource) {
      setFormData({currFormData: selectedResource.content, orgFormData: formData.orgFormData || undefined});
    }
  }, [selectedResource]);

  if (!selectedResource) {
    return <div>Nothing selected...</div>;
  }

  if (!schema || !uiSchema) {
    return <div>Not supported resource type..</div>;
  }

  return (
    <FormContainer contentHeight={contentHeight}>
      <Form
        schema={schema}
        uiSchema={uiSchema}
        formData={formData.currFormData}
        onChange={onFormUpdate}
        onSubmit={onFormSubmit}
        disabled={isInPreviewMode}
      >
        <div />
      </Form>
    </FormContainer>
  );
};

export default FormEditor;
