import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import {useDebounce} from 'react-use';

// @ts-ignore
import {Theme as AntDTheme} from '@rjsf/antd';
import {withTheme} from '@rjsf/core';
import {TemplatesType} from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';

import log from 'loglevel';

import {DEFAULT_EDITOR_DEBOUNCE} from '@constants/constants';

import {isInClusterModeSelector, settingsSelector} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAutosavingStatus} from '@redux/reducers/main';
import {isInPreviewModeSelectorNew, selectedFilePathSelector} from '@redux/selectors';
import {useSelectedResource} from '@redux/selectors/resourceSelectors';
import {mergeManifests} from '@redux/services/manifest-utils';
import {removeSchemaDefaults} from '@redux/services/schema';
import {readFileThunk} from '@redux/thunks/readResourceFile';
import {saveFormEditorResource} from '@redux/thunks/saveFormEditorResource';
import {updateResource} from '@redux/thunks/updateResource';

import {ErrorPage} from '@components/organisms/ErrorPage/ErrorPage';

import {useStateWithRef} from '@utils/hooks';
import {parseYamlDocument, stringifyK8sResource} from '@utils/yaml';

import {isHelmChartFile} from '@shared/utils';
import {isEqual} from '@shared/utils/isEqual';
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
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);
  const selectedFilePath = useAppSelector(selectedFilePathSelector);
  const selectedResource = useSelectedResource();
  const [formData, _setFormData, formDataRef] = useStateWithRef<any>(undefined);
  const [schema, setSchema] = useState<any>({});
  const settings = useAppSelector(settingsSelector);

  const setFormData = useCallback(
    (newFormData: any) => {
      if (isEqual(formDataRef.current, newFormData)) {
        return;
      }
      _setFormData(newFormData);
      dispatch(setAutosavingStatus(true));
    },
    [_setFormData, formDataRef, dispatch]
  );

  const onFormUpdate = useCallback(
    (e: any) => {
      setFormData(e.formData);
    },
    [setFormData]
  );

  useDebounce(
    () => {
      if (!autosavingStatus) {
        return;
      }

      let formString = stringifyK8sResource(formData);

      if (selectedResource) {
        const content = mergeManifests(selectedResource.text, formString);
        const isChanged = content.trim() !== selectedResource.text.trim();
        if (isChanged) {
          dispatch(updateResource({resourceIdentifier: selectedResource, text: content, isUpdateFromForm: true}));
        }
        dispatch(setAutosavingStatus(false));
      } else if (selectedFilePath) {
        dispatch(saveFormEditorResource(formString));
      }
    },
    DEFAULT_EDITOR_DEBOUNCE,
    [formData, selectedResource, selectedFilePath]
  );

  useEffect(() => {
    const loadResourceFile = async () => {
      if (selectedResource) {
        setFormData(selectedResource.object);
      } else if (selectedFilePath) {
        try {
          const fileContent = await dispatch(readFileThunk(selectedFilePath)).unwrap();
          if (fileContent) {
            setFormData(parseYamlDocument(fileContent).toJS());
          }
        } catch (e) {
          log.error(`Failed to read file [${selectedFilePath}]`, e);
        }
      }
    };
    loadResourceFile();

    return () => {
      if (selectedResource || selectedFilePath) {
        trackEvent('edit/form_editor', {resourceKind: selectedResource?.kind});
      }
    };
  }, [dispatch, selectedResource, selectedFilePath, setFormData]);

  useEffect(() => {
    if (!settings.createDefaultObjects || !settings.setDefaultPrimitiveValues) {
      setSchema(removeSchemaDefaults(formSchema, !settings.createDefaultObjects, !settings.setDefaultPrimitiveValues));
    } else {
      setSchema(formSchema);
    }
  }, [settings.createDefaultObjects, settings.setDefaultPrimitiveValues, formSchema]);

  const isReadOnlyMode = useMemo(
    () => isInPreviewMode || (isInClusterMode && !settings.allowEditInClusterMode),
    [isInClusterMode, isInPreviewMode, settings.allowEditInClusterMode]
  );

  if (!selectedResource && selectedFilePath && !isHelmChartFile(selectedFilePath)) {
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
