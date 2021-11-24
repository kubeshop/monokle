import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {useDebounce} from 'react-use';

// @ts-ignore
import {Theme as AntDTheme} from '@rjsf/antd';
import {withTheme} from '@rjsf/core';

import styled from 'styled-components';
import {stringify} from 'yaml';

import {DEFAULT_EDITOR_DEBOUNCE} from '@constants/constants';

import {useAppDispatch} from '@redux/hooks';
import {updateResource} from '@redux/reducers/main';
import {isInPreviewModeSelector, selectedResourceSelector} from '@redux/selectors';
import {loadResource} from '@redux/services';
import {mergeManifests} from '@redux/services/manifest-utils';

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
  const [formData, setFormData] = useState<any>();
  const dispatch = useAppDispatch();
  const isInPreviewMode = useSelector(isInPreviewModeSelector);
  const [schema, setSchema] = useState({});
  const [uiSchema, setUiSchema] = useState({});

  const onFormUpdate = (e: any) => {
    setFormData(e.formData);
  };

  useDebounce(
    () => {
      if (selectedResource) {
        let formString = stringify(formData);
        const content = mergeManifests(selectedResource.text, formString);

        if (content.trim() !== selectedResource.text.trim()) {
          dispatch(updateResource({resourceId: selectedResource.id, content}));
        }
      }
    },
    DEFAULT_EDITOR_DEBOUNCE,
    [formData, selectedResource]
  );

  useEffect(() => {
    if (selectedResource) {
      setFormData(selectedResource.content);
      setSchema(getFormSchema(type === 'metadata' ? type : selectedResource.kind));
      setUiSchema(getUiSchema(type === 'metadata' ? type : selectedResource.kind));
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
      <Form schema={schema} uiSchema={uiSchema} formData={formData} onChange={onFormUpdate} disabled={isInPreviewMode}>
        <div />
      </Form>
    </FormContainer>
  );
};

export default FormEditor;
