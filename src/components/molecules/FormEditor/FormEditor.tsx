import React, {useEffect, useMemo, useState} from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import {useDebounce} from 'react-use';

// @ts-ignore
import {Theme as AntDTheme} from '@rjsf/antd';
import {withTheme} from '@rjsf/core';
import {TemplatesType} from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';

import fs from 'fs';
import log from 'loglevel';
import {stringify} from 'yaml';

import {DEFAULT_EDITOR_DEBOUNCE} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAutosavingError, setAutosavingStatus} from '@redux/reducers/main';
import {isInClusterModeSelector, selectedResourceSelector, settingsSelector} from '@redux/selectors';
import {getAbsoluteFilePath} from '@redux/services/fileEntry';
import {mergeManifests} from '@redux/services/manifest-utils';
import {removeSchemaDefaults} from '@redux/services/schema';
import {updateResource} from '@redux/thunks/updateResource';

import {ErrorPage} from '@components/organisms/ErrorPage/ErrorPage';

import {parseYamlDocument} from '@utils/yaml';

import {isInPreviewModeSelector} from '@shared/utils/selectors';
import {trackEvent} from '@shared/utils/telemetry';

import {FormArrayFieldTemplate} from './FormArrayFieldTemplate';
import * as S from './FormEditor.styled';
import FormObjectFieldTemplate from './FormObjectFieldTemplate';
import {getCustomFormFields, getCustomFormWidgets} from './FormWidgets';

const Form = withTheme(AntDTheme);

const templates: Partial<TemplatesType> = {
  ArrayFieldTemplate: FormArrayFieldTemplate,
  ObjectFieldTemplate: FormObjectFieldTemplate,
};

interface IProps {
  formSchema: any;
  formUiSchema?: any;
}

/**
 * Load schemas every time for now - should be cached in the future...
 */

const FormEditor: React.FC<IProps> = props => {
  const {formSchema, formUiSchema} = props;

  const dispatch = useAppDispatch();
  const autosavingStatus = useAppSelector(state => state.main.autosaving.status);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const selectedResource = useAppSelector(selectedResourceSelector);
  const settings = useAppSelector(settingsSelector);

  const [formData, setFormData] = useState<any>();
  const [isResourceUpdated, setIsResourceUpdated] = useState<boolean>(false);
  const [schema, setSchema] = useState<any>({});

  const changed = useMemo(() => {
    if (!formData) {
      return false;
    }

    let formString = stringify(formData);

    if (selectedResource) {
      const content = mergeManifests(selectedResource.text, formString);
      return content.trim() !== selectedResource.text.trim();
    }

    if (selectedPath) {
      const filePath = getAbsoluteFilePath(selectedPath, fileMap);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const content = mergeManifests(fileContent, formString);
      return content.trim() !== fileContent.trim();
    }

    return false;
  }, [fileMap, formData, selectedPath, selectedResource]);

  const onFormUpdate = (e: any) => {
    setFormData(e.formData);
  };

  useEffect(() => {
    if (!formData) {
      return;
    }

    if (changed && !autosavingStatus) {
      dispatch(setAutosavingStatus(true));
    }
  }, [autosavingStatus, changed, dispatch, formData]);

  useDebounce(
    () => {
      let formString = stringify(formData);
      setIsResourceUpdated(false);

      if (selectedResource) {
        const content = mergeManifests(selectedResource.text, formString);
        const isChanged = content.trim() !== selectedResource.text.trim();
        setIsResourceUpdated(isChanged);
        if (isChanged) {
          dispatch(updateResource({resourceId: selectedResource.id, text: content, isUpdateFromForm: true}));
        } else {
          dispatch(setAutosavingStatus(false));
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
        } catch (e: any) {
          const {message, stack} = e;

          dispatch(setAutosavingError({message, stack}));

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
        trackEvent('edit/form_editor', {resourceKind: selectedResource?.kind});
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

  const isReadOnlyMode = useMemo(
    () => isInPreviewMode || (isInClusterMode && !settings.allowEditInClusterMode),
    [isInClusterMode, isInPreviewMode, settings.allowEditInClusterMode]
  );

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
      <ErrorBoundary
        FallbackComponent={({error}) => <ErrorPage error={error} hideBackButton resetErrorBoundary={() => {}} />}
      >
        <Form
          schema={schema}
          uiSchema={formUiSchema}
          formData={formData}
          templates={templates}
          onChange={onFormUpdate}
          widgets={getCustomFormWidgets()}
          fields={getCustomFormFields()}
          disabled={isReadOnlyMode}
          validator={validator}
        >
          <div />
        </Form>
      </ErrorBoundary>
    </S.FormContainer>
  );
};

export default FormEditor;
