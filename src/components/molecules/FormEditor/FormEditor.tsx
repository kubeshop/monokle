import React, {useEffect, useMemo, useState} from 'react';
import {useSelector} from 'react-redux';
import {useDebounce} from 'react-use';

// @ts-ignore
import {Theme as AntDTheme} from '@rjsf/antd';
import {withTheme} from '@rjsf/core';

import fs from 'fs';
import log from 'loglevel';
import {stringify} from 'yaml';

import {DEFAULT_EDITOR_DEBOUNCE} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAutosavingStatus} from '@redux/reducers/main';
import {isInPreviewModeSelector, selectedResourceSelector, settingsSelector} from '@redux/selectors';
import {getAbsoluteFilePath} from '@redux/services/fileEntry';
import {mergeManifests} from '@redux/services/manifest-utils';
import {removeSchemaDefaults} from '@redux/services/schema';
import {updateResource} from '@redux/thunks/updateResource';

import {CHANGES_BY_FORM_EDITOR, trackEvent} from '@utils/telemetry';
import {parseYamlDocument} from '@utils/yaml';

import * as S from './FormEditor.styled';
import {getCustomFormFields, getCustomFormWidgets} from './FormWidgets';

const Form = withTheme(AntDTheme);

/**
 * Load schemas every time for now - should be cached in the future...
 */

const FormEditor = (props: {formSchema: any; formUiSchema?: any}) => {
  const {formSchema, formUiSchema} = props;
  const dispatch = useAppDispatch();
  const fileMap = useAppSelector(state => state.main.fileMap);
  const isAutosaving = useAppSelector(state => state.main.isAutosaving);
  const isInPreviewMode = useSelector(isInPreviewModeSelector);
  const previewType = useAppSelector(state => state.main.previewType);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const selectedResource = useAppSelector(selectedResourceSelector);
  const settings = useSelector(settingsSelector);

  const [formData, setFormData] = useState<any>();
  const [isResourceUpdated, setIsResourceUpdated] = useState<boolean>(false);
  const [schema, setSchema] = useState<any>({});

  const onFormUpdate = (e: any) => {
    if (!isAutosaving) {
      dispatch(setAutosavingStatus(true));
    }

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
          dispatch(updateResource({resourceId: selectedResource.id, text: content}));
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
          // TODO: autosaving error report

          log.error(`Failed to update file [${selectedPath}]`, e);
        } finally {
          dispatch(setAutosavingStatus(false));
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
    <S.FormContainer>
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
    </S.FormContainer>
  );
};

export default FormEditor;
