import React, {useEffect, useState} from 'react';

import {Divider, Skeleton} from 'antd';

// @ts-ignore
import {Theme as AntDTheme} from '@rjsf/antd';
import {withTheme} from '@rjsf/core';

import fs from 'fs';

import {TemplateForm, TemplatePluginModule} from '@models/plugin';
import {isReferencedHelmChartTemplatePluginModule} from '@models/plugin.guard';

const Form = withTheme(AntDTheme);

const readTemplateFormSchemas = (templateForm: TemplateForm) => {
  const schema = fs.readFileSync(templateForm.schema, 'utf8');
  const uiSchema = fs.readFileSync(templateForm.uiSchema, 'utf8');
  return {schema, uiSchema};
};

const TemplateFormRenderer: React.FC<{
  template: TemplatePluginModule;
  formData: any;
  onFormDataChange: (formData: any) => void;
}> = props => {
  const {template, formData, onFormDataChange} = props;

  const [errorMessage, setErrorMessage] = useState<string | null>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [schema, setSchema] = useState<any>();
  const [uiSchema, setUiSchema] = useState<any>();

  useEffect(() => {
    try {
      const schemas = readTemplateFormSchemas(template.forms[0]);
      setSchema(JSON.parse(schemas.schema));
      setUiSchema(JSON.parse(schemas.uiSchema));
      setErrorMessage(null);
      setIsLoading(false);
    } catch {
      setErrorMessage("Couldn't read the schemas for this template.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isReferencedHelmChartTemplatePluginModule(template)) {
    return <p>This type of template is not supported yet.</p>;
  }

  if (isLoading) {
    return <Skeleton />;
  }

  if (errorMessage) {
    return <p>{errorMessage}</p>;
  }

  return (
    <>
      <h1>{template.forms[0].name}</h1>
      <p>{template.forms[0].description}</p>
      <Divider />
      <Form schema={schema} uiSchema={uiSchema} formData={formData} onChange={e => onFormDataChange(e.formData)}>
        <div />
      </Form>
    </>
  );
};

export default TemplateFormRenderer;
