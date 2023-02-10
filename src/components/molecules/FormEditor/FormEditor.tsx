import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import {useDebounce} from 'react-use';

// @ts-ignore
import {Theme as AntDTheme} from '@rjsf/antd';
import {withTheme} from '@rjsf/core';
import {TemplatesType} from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';

import fs from 'fs';
import {isEqual} from 'lodash';
import log from 'loglevel';
import {stringify} from 'yaml';

import {DEFAULT_EDITOR_DEBOUNCE} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAutosavingError, setAutosavingStatus} from '@redux/reducers/main';
import {
  isInClusterModeSelector,
  isInPreviewModeSelectorNew,
  selectedFilePathSelector,
  settingsSelector,
} from '@redux/selectors';
import {useSelectedResource} from '@redux/selectors/resourceSelectors';
import {getAbsoluteFilePath} from '@redux/services/fileEntry';
import {mergeManifests} from '@redux/services/manifest-utils';
import {removeSchemaDefaults} from '@redux/services/schema';
import {updateResource} from '@redux/thunks/updateResource';

import {ErrorPage} from '@components/organisms/ErrorPage/ErrorPage';

import {useStateWithRef} from '@utils/hooks';
import {parseYamlDocument} from '@utils/yaml';

import {trackEvent} from '@shared/utils/telemetry';
import {useWhatChanged} from '@simbathesailor/use-what-changed';

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
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);
  const selectedFilePath = useAppSelector(selectedFilePathSelector);
  const selectedResource = useSelectedResource();
  const settings = useAppSelector(settingsSelector);

  const [formData, _setFormData, formDataRef] = useStateWithRef<any>(undefined);
  const isResourceUpdatedRef = useRef(false);
  const [schema, setSchema] = useState<any>({});

  const setFormData = useCallback(
    (newFormData: any, fromWhere: string) => {
      if (isEqual(formDataRef.current, newFormData)) {
        return;
      }
      _setFormData(newFormData);
    },
    [_setFormData, formDataRef]
  );

  const changed = useMemo(() => {
    if (!formData) {
      return false;
    }

    let formString = stringify(formData);

    if (selectedResource?.text) {
      const content = mergeManifests(selectedResource.text, formString);
      return content.trim() !== selectedResource.text.trim();
    }

    if (selectedFilePath) {
      // TODO: don't we store the content of all files in the fileMap?
      const absoluteFilePath = getAbsoluteFilePath(selectedFilePath, fileMap);
      const fileContent = fs.readFileSync(absoluteFilePath, 'utf8');
      const content = mergeManifests(fileContent, formString);
      return content.trim() !== fileContent.trim();
    }

    return false;
  }, [fileMap, formData, selectedFilePath, selectedResource?.text]);

  useWhatChanged([fileMap, selectedFilePath, selectedResource, settings, formData, changed]);

  const onFormUpdate = useCallback(
    (e: any) => {
      setFormData(e.formData, 'onFormUpdate');
    },
    [setFormData]
  );

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
      isResourceUpdatedRef.current = false;

      if (selectedResource) {
        const content = mergeManifests(selectedResource.text, formString);
        const isChanged = content.trim() !== selectedResource.text.trim();
        isResourceUpdatedRef.current = isChanged;

        if (isChanged) {
          dispatch(updateResource({resourceIdentifier: selectedResource, text: content, isUpdateFromForm: true}));
        } else {
          dispatch(setAutosavingStatus(false));
        }
      } else if (selectedFilePath) {
        try {
          const absoluteFilePath = getAbsoluteFilePath(selectedFilePath, fileMap);
          const fileContent = fs.readFileSync(absoluteFilePath, 'utf8');
          const content = mergeManifests(fileContent, formString);
          const isChanged = content.trim() !== fileContent.trim();
          isResourceUpdatedRef.current = isChanged;

          if (isChanged) {
            fs.writeFileSync(absoluteFilePath, content);
          }
        } catch (e: any) {
          const {message, stack} = e;

          dispatch(setAutosavingError({message, stack}));

          log.error(`Failed to update file [${selectedFilePath}]`, e);
        } finally {
          dispatch(setAutosavingStatus(false));
        }
      }
    },
    DEFAULT_EDITOR_DEBOUNCE,
    [formData, selectedResource, selectedFilePath]
  );

  useEffect(() => {
    if (selectedResource) {
      setFormData(selectedResource.object, 'useEffect selectedResource');
    } else if (selectedFilePath) {
      try {
        const absoluteFilePath = getAbsoluteFilePath(selectedFilePath, fileMap);
        const fileContent = fs.readFileSync(absoluteFilePath, 'utf8');
        setFormData(parseYamlDocument(fileContent).toJS(), 'useEffect selectedFilePath');
      } catch (e) {
        log.error(`Failed to read file [${selectedFilePath}]`, e);
      }
    }

    return () => {
      if ((selectedResource || selectedFilePath) && isResourceUpdatedRef.current) {
        trackEvent('edit/form_editor', {resourceKind: selectedResource?.kind});
      }
    };
  }, [selectedResource, selectedFilePath, fileMap, setFormData]);

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

  if (!selectedResource && selectedFilePath) {
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
