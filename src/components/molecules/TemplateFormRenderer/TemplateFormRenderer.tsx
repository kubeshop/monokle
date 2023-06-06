import React, {useEffect, useState} from 'react';

import {Button, Skeleton} from 'antd';

import {ExportOutlined} from '@ant-design/icons';

// @ts-ignore
import {Theme as AntDTheme} from '@rjsf/antd';
import {withTheme} from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';

import fs from 'fs';
import log from 'loglevel';
import {Primitive} from 'type-fest';

import {VALID_IMAGE_NAME_REGEX, VALID_RESOURCE_NAME_REGEX} from '@constants/constants';

import {getCustomFormWidgets} from '@molecules/FormEditor/FormWidgets';

import {TemplateForm} from '@shared/models/template';

import TemplateFormErrorBoundary from './TemplateFormErrorBoundary';
import * as S from './TemplateFormRenderer.styled';

const Form = withTheme(AntDTheme);

const readTemplateFormSchemas = (templateForm: TemplateForm) => {
  const schema = fs.readFileSync(templateForm.schema, 'utf8');
  const uiSchema = fs.readFileSync(templateForm.uiSchema, 'utf8');
  return {schema, uiSchema};
};

interface IProps {
  defaultFormData: Record<string, Primitive>;
  isFirstForm: boolean;
  isLastForm: boolean;
  templateForm: TemplateForm;
  onBackHandler: () => void;
  onSubmit: (formData: any) => void;
}

const TemplateFormRenderer: React.FC<IProps> = props => {
  const {defaultFormData, templateForm, isFirstForm, isLastForm, onBackHandler, onSubmit} = props;

  const [formData, setFormData] = useState<Record<string, Primitive>>(defaultFormData);
  const [errorMessage, setErrorMessage] = useState<string | null>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [schema, setSchema] = useState<any>();
  const [uiSchema, setUiSchema] = useState<any>();
  const [displayLink, setDisplayLink] = useState<boolean>(false);

  const customValidate = (fData: Record<string, Primitive>, errors: any) => {
    if (!fData) {
      return errors;
    }

    if (fData.name && !VALID_RESOURCE_NAME_REGEX.test(fData.name.toString())) {
      errors.name.addError(
        "must consist of lower case alphanumeric characters or '-', and must start and end with an alphanumeric character"
      );
    }

    if (fData.image && !VALID_IMAGE_NAME_REGEX.test(fData.image.toString())) {
      errors.image.addError(`name must be in the format <registry>/<image>:<tag> and should not start with a \':\'`);
    }

    if (fData.namespace && !VALID_RESOURCE_NAME_REGEX.test(fData.namespace.toString())) {
      errors.namespace.addError(
        "must consist of lower case alphanumeric characters or '-', and must start and end with an alphanumeric character"
      );
    }

    return errors;
  };

  const handleErrorLink = () => {
    if (
      (formData.name && !VALID_RESOURCE_NAME_REGEX.test(formData.name.toString())) ||
      (formData.image && !VALID_IMAGE_NAME_REGEX.test(formData.image.toString())) ||
      (formData.namespace && !VALID_RESOURCE_NAME_REGEX.test(formData.namespace.toString()))
    ) {
      setDisplayLink(true);
    }
  };

  useEffect(() => {
    try {
      setIsLoading(true);
      setFormData(defaultFormData);
      const schemas = readTemplateFormSchemas(templateForm);
      setSchema(JSON.parse(schemas.schema));
      setUiSchema(JSON.parse(schemas.uiSchema));
      setErrorMessage(null);
      setIsLoading(false);
    } catch (e) {
      if (e instanceof Error) {
        log.warn(`[loadTemplateSchemas]: ${e.message}`);
      }
      setErrorMessage("Couldn't read the schemas for this template form.");
      setIsLoading(false);
    }
  }, [defaultFormData, templateForm]);

  if (isLoading) {
    return <Skeleton active />;
  }

  if (errorMessage) {
    return <p>{errorMessage}</p>;
  }

  return (
    <TemplateFormErrorBoundary>
      {displayLink && (
        <S.ErrorContainer>
          <S.ErrorText>
            <S.ReadMoreLink
              onClick={() => {
                window.open('https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names');
              }}
            >
              Read more{` `}
              <ExportOutlined />
            </S.ReadMoreLink>
            {` about the naming conventions for Kubernetes resources.`}
          </S.ErrorText>
        </S.ErrorContainer>
      )}
      <Form
        onSubmit={e => onSubmit(e.formData)}
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        widgets={getCustomFormWidgets()}
        onChange={e => setFormData(e.formData)}
        noHtml5Validate
        customValidate={customValidate}
        validator={validator}
      >
        {!isFirstForm && (
          <Button style={{marginRight: '10px'}} onClick={onBackHandler}>
            Back
          </Button>
        )}

        <Button htmlType="submit" onClick={handleErrorLink} type="primary" style={{marginTop: '16px'}}>
          {isLastForm ? 'Submit' : 'Next'}
        </Button>
      </Form>
    </TemplateFormErrorBoundary>
  );
};

export default TemplateFormRenderer;
