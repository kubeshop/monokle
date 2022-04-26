import React, {useEffect, useMemo, useState} from 'react';
import {useSelector} from 'react-redux';
import {useDebounce} from 'react-use';

// @ts-ignore
import {Theme as AntDTheme} from '@rjsf/antd';
import {withTheme} from '@rjsf/core';

import fs from 'fs';
import log from 'loglevel';
import styled from 'styled-components';
import {stringify} from 'yaml';

import {DEFAULT_EDITOR_DEBOUNCE} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {isInPreviewModeSelector, selectedResourceSelector, settingsSelector} from '@redux/selectors';
import {getAbsoluteFilePath} from '@redux/services/fileEntry';
import {mergeManifests} from '@redux/services/manifest-utils';
import {removeSchemaDefaults} from '@redux/services/schema';
import {updateResource} from '@redux/thunks/updateResource';

import {GlobalScrollbarStyle} from '@utils/scrollbar';
import {CHANGES_BY_FORM_EDITOR, trackEvent} from '@utils/telemetry';
import {parseYamlDocument} from '@utils/yaml';

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
  overflow-y: auto;
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
  const [isResourceUpdated, setIsResourceUpdated] = useState<boolean>(false);
  const previewType = useAppSelector(state => state.main.previewType);

  const onFormUpdate = (e: any) => {
    setFormData(e.formData);
  };

  useDebounce(
    () => {
      let formString = stringify(formData);
      setIsResourceUpdated(false);

      if (selectedResource) {
        const content = mergeManifests(selectedResource.text, formString);
        const isChanged = content.trim() !== selectedResource.text.trim();
        setIsResourceUpdated(isChanged);
        if (isChanged) {
          dispatch(updateResource({resourceId: selectedResource.id, content}));
        }
      } else if (selectedPath) {
        try {
          const filePath = getAbsoluteFilePath(selectedPath, fileMap);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const content = mergeManifests(fileContent, formString);
          const isChanged = content.trim() !== fileContent.trim();
          setIsResourceUpdated(isChanged);
          if (isChanged) {
            fs.writeFileSync(filePath, content);
          }
        } catch (e) {
          log.error(`Failed to update file [${selectedPath}]`, e);
        }
      }
    },
    DEFAULT_EDITOR_DEBOUNCE,
    [formData, selectedResource, selectedPath]
  );

  useEffect(() => {
    if (selectedResource) {
      setFormData(selectedResource.content);
    } else if (selectedPath) {
      try {
        const filePath = getAbsoluteFilePath(selectedPath, fileMap);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        setFormData(parseYamlDocument(fileContent).toJS());
      } catch (e) {
        log.error(`Failed to read file [${selectedPath}]`, e);
      }
    }

    return () => {
      if ((selectedResource || selectedPath) && isResourceUpdated) {
        trackEvent(CHANGES_BY_FORM_EDITOR, {resourceKind: selectedResource?.kind});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResource, selectedPath, fileMap]);

  useEffect(() => {
    if (!settings.createDefaultObjects || !settings.setDefaultPrimitiveValues) {
      setSchema(removeSchemaDefaults(formSchema, !settings.createDefaultObjects, !settings.setDefaultPrimitiveValues));
    } else {
      setSchema(formSchema);
    }
  }, [formSchema, settings]);

  const isReadOnlyMode = useMemo(() => {
    return isInPreviewMode && previewType === 'cluster' && !settings.allowEditInClusterMode;
  }, [isInPreviewMode, previewType, settings.allowEditInClusterMode]);

  if (!selectedResource && !selectedPath) {
    return <div>Nothing selected..</div>;
  }

  if (!formSchema) {
    return <div>Not supported resource type..</div>;
  }

  // no properties in schema?
  if (!schema.properties || Object.keys(schema.properties).length === 0) {
    // no custom form field?
    if (!formUiSchema || !formUiSchema['ui:field'] || !getCustomFormFields()[formUiSchema['ui:field']]) {
      return <div>Missing Form configuration for this resource kind.</div>;
    }
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
        disabled={isReadOnlyMode}
      >
        <div />
      </Form>
    </FormContainer>
  );
};

export default FormEditor;
