import * as React from 'react';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {withTheme} from '@rjsf/core';
// @ts-ignore
import {Theme as AntDTheme} from '@rjsf/antd';
import {loadResource} from '@redux/utils';
import {useCallback, useEffect, useState} from 'react';
import {updateResource} from '@redux/reducers/main';
import {logMessage} from '@redux/utils/log';
import {parse, stringify} from 'yaml';
import {mergeManifests} from '@redux/utils/manifest-utils';
import styled from 'styled-components';
import {notification, Tooltip} from 'antd';
import {useSelector} from 'react-redux';
import {inPreviewMode} from '@redux/selectors';
import {MonoButton} from '@atoms';
import {K8sResource} from '@models/k8sresource';
import {SaveFormTooltip} from '@src/tooltips';

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
  padding-left: 15px;
  padding-bottom: 10px;
`;

const FormContainer = styled.div<{contentHeight: string}>`
  width: 100%;
  padding-left: 15px;
  padding-right: 20px;
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
  }

  .array-item-add {
    background: black;
    color: #177ddc;
  }

  .array-item-remove {
    background: black;
    color: #177ddc;
  }

  .array-item-move-up {
    background: black;
    color: #177ddc;
  }

  .array-item-move-down {
    background: black;
    color: #177ddc;
  }

  .ant-btn-dangerous {
    background: black;
    color: #177ddc;
  }
`;

const FormEditor = (props: {contentHeight: string}) => {
  const {contentHeight} = props;
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedResource = useAppSelector(state => state.main.selectedResource);
  const [formData, setFormData] = useState(null);
  const dispatch = useAppDispatch();
  const [resource, setResource] = useState<K8sResource>();
  const isInPreviewMode = useSelector(inPreviewMode);

  useEffect(() => {
    setResource(resourceMap && selectedResource ? resourceMap[selectedResource] : undefined);
  }, [selectedResource, resourceMap, setResource]);

  useEffect(() => {
    if (resource) {
      setFormData(parse(resource.text));
    }
  }, [resource]);

  const onFormUpdate = (e: any) => {
    setFormData(e.formData);
  };

  const onFormSubmit = (data: any, e: any) => {
    let formString = stringify(data.formData);
    try {
      if (resource) {
        const content = mergeManifests(resource.text, formString);
        /*
                log.debug(resource.text);
                log.debug(formString);
                log.debug(content);
        */
        dispatch(updateResource({resourceId: resource.id, content}));
        openNotification();
      }
    } catch (err) {
      logMessage(`Failed to update resource ${err}`, dispatch);
    }
  };

  const openNotification = () => {
    notification['success']({
      message: 'ConfigMap Saved.',
      duration: 3,
    });
  };

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
        <Tooltip title={SaveFormTooltip}>
          <MonoButton large type="primary" onClick={submitForm} disabled={isInPreviewMode}>
            Save
          </MonoButton>
        </Tooltip>
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
