import React, {useEffect, useState} from 'react';

import {Button, Divider, Skeleton} from 'antd';

// @ts-ignore
import {Theme as AntDTheme} from '@rjsf/antd';
import {withTheme} from '@rjsf/core';

import fs from 'fs';
import {Primitive} from 'type-fest';

import {TemplateForm} from '@models/template';

const Form = withTheme(AntDTheme);

const readTemplateFormSchemas = (templateForm: TemplateForm) => {
  const schema = fs.readFileSync(templateForm.schema, 'utf8');
  const uiSchema = fs.readFileSync(templateForm.uiSchema, 'utf8');
  return {schema, uiSchema};
};

const TemplateFormRenderer: React.FC<{
  templateForm: TemplateForm;
  isLastForm: boolean;
  onSubmit: (formData: any) => void;
}> = props => {
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
    } catch {
      setErrorMessage("Couldn't read the schemas for this template form.");
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
    <>
      <h1>{templateForm.name}</h1>
      <p>{templateForm.description}</p>
      <Divider />
      <Form
        onSubmit={e => onSubmit(e.formData)}
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        onChange={e => setFormData(e.formData)}
        noHtml5Validate
      >
        <Button htmlType="submit" type="primary" style={{marginTop: '16px'}}>
          {isLastForm ? 'Submit' : 'Next'}
        </Button>
      </Form>
    </>
  );
};

export default TemplateFormRenderer;
