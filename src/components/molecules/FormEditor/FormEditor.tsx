import * as React from 'react';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {withTheme} from '@rjsf/core';

// @ts-ignore
import {Theme as AntDTheme} from '@rjsf/antd';
import {loadResource} from '@redux/services';
import {useCallback, useEffect, useState} from 'react';
import {updateResource} from '@redux/reducers/main';
import {logMessage} from '@redux/services/log';
import {parse, stringify} from 'yaml';
import {mergeManifests} from '@redux/services/manifest-utils';
import styled from 'styled-components';
import {useSelector} from 'react-redux';
import {inPreviewMode} from '@redux/selectors';
import {MonoButton} from '@atoms';
import {K8sResource} from '@models/k8sresource';
import equal from 'fast-deep-equal/es6/react';

const Form = withTheme(AntDTheme);

/**
 * Load schemas every time for now - should be cached in the future...
 */

function getFormSchema(kind: string) {
  return JSON.parse(loadResource(`form-schemas/${kind.toLowerCase()}-schema.json`));
}

function getUiSchema(kind: string) {
  return JSON.parse(loadResource(`form-schemas/${kind.toLowerCase()}-ui-schema.json`));
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
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedResource = useAppSelector(state => state.main.selectedResource);
  const [formData, setFormData] = useState(null);
  const [hasChanged, setHasChanged] = useState<boolean>(false);
  const [orgFormData, setOrgFormData] = useState<any>(undefined);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [updatingResource, setUpdatingResource] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const [resource, setResource] = useState<K8sResource>();
  const isInPreviewMode = useSelector(inPreviewMode);

  useEffect(() => {
    if (resourceMap && selectedResource) {
      setResource(resourceMap[selectedResource]);
    }
  }, [selectedResource, resourceMap]);

  useEffect(() => {
    if (resource) {
      console.log('updating form resource', initialized, updatingResource);
      if (!updatingResource) {
        setInitialized(false);
        setFormData(parse(resource.text));
      } else {
        setUpdatingResource(false);
      }
    }
  }, [resource]);

  const onFormUpdate = useCallback(
    (e: any) => {
      console.log('form update ', initialized, formData, orgFormData, e.formData, resource);

      if (initialized) {
        setHasChanged(!equal(e.formData, orgFormData));
      } else {
        setOrgFormData(e.formData);
        setHasChanged(false);
        setInitialized(true);
      }

      setFormData(e.formData);
    },
    [orgFormData, initialized]
  );

  const onFormSubmit = useCallback(
    (data: any, e: any) => {
      try {
        if (resource) {
          let formString = stringify(data.formData);
          const content = mergeManifests(resource.text, formString);

          /* log.debug(resource.text);
          log.debug(formString);
          log.debug(content); */

          setUpdatingResource(true);
          dispatch(updateResource({resourceId: resource.id, content}));
          setHasChanged(false);
          setOrgFormData(data.formData);
        }
      } catch (err) {
        logMessage(`Failed to update resource ${err}`, dispatch);
      }
    },
    [resource]
  );

  const submitForm = useCallback(() => {
    if (formData) {
      onFormSubmit({formData}, null);
    }
  }, [formData]);

  if (!selectedResource) {
    return <div>Nothing selected...</div>;
  }

  if (resource?.kind !== 'ConfigMap') {
    return <div>Form editor only for ConfigMap resources...</div>;
  }

  let schema = getFormSchema(resource.kind);
  let uiSchema = getUiSchema(resource.kind);

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
          formData={formData}
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
