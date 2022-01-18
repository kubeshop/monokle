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
import {mergeManifests} from '@redux/services/manifest-utils';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

import {NamespaceSelection, SecretKindResourceForm, SecretKindSelection} from './FormWidgets';

const Form = withTheme(AntDTheme);

/**
 * Load schemas every time for now - should be cached in the future...
 */

const FormContainer = styled.div`
  height: 100%;
  width: 100%;
  padding: 20px 15px 0px 15px;
  margin: 0px;
  overflow-y: scroll;
  overflow-x: hidden;

  ${GlobalScrollbarStyle}

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

const FormEditor = (props: {formSchema: any; formUiSchema: any}) => {
  const {formSchema, formUiSchema} = props;
  const selectedResource = useSelector(selectedResourceSelector);
  const [formData, setFormData] = useState<any>();
  const dispatch = useAppDispatch();
  const isInPreviewMode = useSelector(isInPreviewModeSelector);

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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResource]);

  if (!selectedResource) {
    return <div>Nothing selected...</div>;
  }

  if (!formSchema) {
    return <div>Not supported resource type..</div>;
  }

  return (
    <FormContainer>
      <Form
        schema={formSchema}
        uiSchema={formUiSchema}
        formData={formData}
        onChange={onFormUpdate}
        widgets={{
          namespaceSelection: NamespaceSelection,
        }}
        fields={{
          secretKindSelection: SecretKindSelection,
          secretKindForm: SecretKindResourceForm,
        }}
        disabled={isInPreviewMode}
      >
        <div />
      </Form>
    </FormContainer>
  );
};

export default FormEditor;
