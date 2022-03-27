import React, {useEffect, useState} from 'react';

import {Button, Divider, Skeleton} from 'antd';

// @ts-ignore
import {Theme as AntDTheme} from '@rjsf/antd';
import {withTheme} from '@rjsf/core';

import fs from 'fs';
import log from 'loglevel';
import {Primitive} from 'type-fest';

import {TemplateForm} from '@models/template';

import {getCustomFormWidgets} from '@molecules/FormEditor/FormWidgets';

import Colors from '@styles/Colors';

import TemplateFormErrorBoundary from './TemplateFormErrorBoundary';

const Form = withTheme(AntDTheme);

const readTemplateFormSchemas = (templateForm: TemplateForm) => {
  const schema = fs.readFileSync(templateForm.schema, 'utf8');
  const uiSchema = fs.readFileSync(templateForm.uiSchema, 'utf8');
  return {schema, uiSchema};
};

interface IProps {
  isLastForm: boolean;
  templateForm: TemplateForm;
  onSubmit: (formData: any) => void;
}

const TemplateFormRenderer: React.FC<IProps> = props => {
  const {templateForm, isLastForm, onSubmit} = props;

  const [formData, setFormData] = useState<Record<string, Primitive>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [schema, setSchema] = useState<any>();
  const [uiSchema, setUiSchema] = useState<any>();

  useEffect(() => {
    try {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <Skeleton />;
  }

  if (errorMessage) {
    return <p>{errorMessage}</p>;
  }

  return (
    <TemplateFormErrorBoundary>
      <h2>{templateForm.name}</h2>
      <p style={{color: Colors.grey7}}>{templateForm.description}</p>
      <Divider />
      <Form
        onSubmit={e => onSubmit(e.formData)}
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        widgets={getCustomFormWidgets()}
        onChange={e => setFormData(e.formData)}
        noHtml5Validate
      >
        <Button htmlType="submit" type="primary" style={{marginTop: '16px'}}>
          {isLastForm ? 'Submit' : 'Next'}
        </Button>
      </Form>
    </TemplateFormErrorBoundary>
  );
};

export default TemplateFormRenderer;
