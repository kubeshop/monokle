import * as React from 'react';
import {useAppDispatch} from '@redux/hooks';
import {withTheme} from '@rjsf/core';

// @ts-ignore
import {Theme as AntDTheme} from '@rjsf/antd';
import {loadResource} from '@redux/services';
import {useCallback, useEffect, useState} from 'react';
import {saveResource} from '@redux/reducers/main';
import {logMessage} from '@redux/services/log';
import {stringify} from 'yaml';
import {mergeManifests} from '@redux/services/manifest-utils';
import styled from 'styled-components';
import {useSelector} from 'react-redux';
import {isInPreviewModeSelector, selectedResourceSelector} from '@redux/selectors';
import {MonoButton} from '@atoms';
import equal from 'fast-deep-equal/es6/react';

const Form = withTheme(AntDTheme);

/**
 * Load schemas every time for now - should be cached in the future...
 */

const formSchemaCache = new Map<string, any>();
const uiformSchemaCache = new Map<string, any>();

function getFormSchema(kind: string) {
  if (!formSchemaCache.has(kind)) {
    formSchemaCache.set(kind, JSON.parse(loadResource(`form-schemas/${kind.toLowerCase()}-schema.json`)));
  }

  return formSchemaCache.get(kind);
}

function getUiSchema(kind: string) {
  if (!uiformSchemaCache.has(kind)) {
    uiformSchemaCache.set(kind, JSON.parse(loadResource(`form-schemas/${kind.toLowerCase()}-ui-schema.json`)));
  }

  return uiformSchemaCache.get(kind);
}

const FormButtons = styled.div`
  padding: 8px;
  padding-right: 8px;
  height: 40px;
`;

const RightMonoButton = styled(MonoButton)`
  float: right;
`;

const FormContainer = styled.div<{contentHeight: string}>`
  width: 100%;
  padding-left: 15px;
  padding-right: 8px;
  margin: 0px;
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

const FormEditor = (props: {contentHeight: string}) => {
  const {contentHeight} = props;
  const selectedResource = useSelector(selectedResourceSelector);
  const [formData, setFormData] = useState<any>({formData: undefined, orgFormData: undefined});
  const [hasChanged, setHasChanged] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const isInPreviewMode = useSelector(isInPreviewModeSelector);

  const onFormUpdate = useCallback(
    (e: any) => {
      if (formData.orgFormData) {
        setFormData({formData: e.formData, orgFormData: formData.orgFormData});
        setHasChanged(!equal(e.formData, formData.orgFormData));
      } else {
        setFormData({formData: e.formData, orgFormData: e.formData});
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

          setFormData({formData: formData.formData, orgFormData: data});
          setHasChanged(false);
          dispatch(saveResource({resourceId: selectedResource.id}));
        }
      } catch (err) {
        logMessage(`Failed to update resource ${err}`, dispatch);
      }
    },
    [selectedResource]
  );

  const submitForm = useCallback(() => {
    if (formData) {
      onFormSubmit(formData.formData, null);
    }
  }, [formData]);

  useEffect(() => {
    if (selectedResource) {
      setFormData({formData: selectedResource.content, orgFormData: undefined});
    }
  }, [selectedResource]);

  if (!selectedResource) {
    return <div>Nothing selected...</div>;
  }

  if (selectedResource?.kind !== 'ConfigMap') {
    return <div>Form editor only for ConfigMap resources...</div>;
  }

  let schema = getFormSchema(selectedResource.kind);
  let uiSchema = getUiSchema(selectedResource.kind);

  return (
    // @ts-ignore
    <>
      <FormButtons>
        <RightMonoButton large="true" type="primary" onClick={submitForm} disabled={isInPreviewMode || !hasChanged}>
          Save
        </RightMonoButton>
      </FormButtons>
      <FormContainer contentHeight={contentHeight}>
        <Form
          schema={schema}
          uiSchema={uiSchema}
          formData={formData.formData}
          onChange={onFormUpdate}
          onSubmit={onFormSubmit}
          disabled={isInPreviewMode}
        >
          <div />
        </Form>
      </FormContainer>
    </>
  );
};

export default FormEditor;
