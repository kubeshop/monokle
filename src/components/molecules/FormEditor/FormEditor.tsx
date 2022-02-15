import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {useDebounce} from 'react-use';

// @ts-ignore
import {Theme as AntDTheme} from '@rjsf/antd';
import {withTheme} from '@rjsf/core';

import fs from 'fs';
import log from 'loglevel';
import styled from 'styled-components';
import {parseDocument, stringify} from 'yaml';

import {DEFAULT_EDITOR_DEBOUNCE} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateResource} from '@redux/reducers/main';
import {isInPreviewModeSelector, selectedResourceSelector, settingsSelector} from '@redux/selectors';
import {getAbsoluteFilePath} from '@redux/services/fileEntry';
import {mergeManifests} from '@redux/services/manifest-utils';
import {removeSchemaDefaults} from '@redux/services/schema';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

import {getCustomFormFields, getCustomFormWidgets} from './FormWidgets';

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

const FormEditor = (props: {formSchema: any; formUiSchema?: any}) => {
  const {formSchema, formUiSchema} = props;
  const selectedResource = useSelector(selectedResourceSelector);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const [formData, setFormData] = useState<any>();
  const dispatch = useAppDispatch();
  const isInPreviewMode = useSelector(isInPreviewModeSelector);
  const settings = useSelector(settingsSelector);
  const [schema, setSchema] = useState<any>({});

  const onFormUpdate = (e: any) => {
    setFormData(e.formData);
  };

  useDebounce(
    () => {
      let formString = stringify(formData);

      if (selectedResource) {
        const content = mergeManifests(selectedResource.text, formString);
        if (content.trim() !== selectedResource.text.trim()) {
          dispatch(updateResource({resourceId: selectedResource.id, content}));
        }
      } else if (selectedPath) {
        try {
          const filePath = getAbsoluteFilePath(selectedPath, fileMap);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const content = mergeManifests(fileContent, formString);
          if (content.trim() !== fileContent.trim()) {
            fs.writeFileSync(filePath, content);
          }
        } catch (e) {
          log.error(`Failed to update file [${selectedPath}]`, e);
        }
      }
    },
    DEFAULT_EDITOR_DEBOUNCE,
    [formData, selectedResource]
  );

  useEffect(() => {
    if (selectedResource) {
      setFormData(selectedResource.content);
    } else if (selectedPath) {
      try {
        const filePath = getAbsoluteFilePath(selectedPath, fileMap);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        setFormData(parseDocument(fileContent).toJS());
      } catch (e) {
        log.error(`Failed to read file [${selectedPath}]`, e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResource, selectedPath]);

  useEffect(() => {
    if (!settings.createDefaultObjects || !settings.setDefaultPrimitiveValues) {
      setSchema(removeSchemaDefaults(formSchema, !settings.createDefaultObjects, !settings.setDefaultPrimitiveValues));
    } else {
      setSchema(formSchema);
    }
  }, [formSchema, settings]);

  if (!selectedResource && !selectedPath) {
    return <div>Nothing selected...</div>;
  }

  if (!formSchema) {
    return <div>Not supported resource type..</div>;
  }

  return (
    <FormContainer>
      <Form
        schema={schema}
        uiSchema={formUiSchema}
        formData={formData}
        onChange={onFormUpdate}
        widgets={getCustomFormWidgets()}
        fields={getCustomFormFields()}
        disabled={isInPreviewMode}
      >
        <div />
      </Form>
    </FormContainer>
  );
};

export default FormEditor;
