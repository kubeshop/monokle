import path from 'path';

import {Template, isHelmChartTemplate} from '@models/template';

const parseTemplate = (template: Template, templateFolderPath: string): Template => {
  const updatedTemplate = {
    ...template,
    forms: template.forms.map(form => {
      return {
        ...form,
        schema: path.join(templateFolderPath, form.schema),
        uiSchema: path.join(templateFolderPath, form.uiSchema),
      };
    }),
  };
  if (isHelmChartTemplate(updatedTemplate)) {
    return {
      ...updatedTemplate,
      valuesFilePath: path.join(templateFolderPath, updatedTemplate.valuesFilePath),
    };
  }
  return updatedTemplate;
};
