import path from 'path';

import {MonokleTemplate, isHelmChartTemplate} from '@models/template';

const parseTemplate = (template: MonokleTemplate, templateFolderPath: string): MonokleTemplate => {
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
