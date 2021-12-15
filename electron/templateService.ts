import path from 'path';

import {AnyTemplate, isHelmChartTemplate, isTemplateDiscovery} from '@models/template';

async function fetchTemplateDiscovery(repositoryOwner: string, repositoryName: string, targetCommitish: string) {
  const templateDiscoveryUrl = `https://raw.githubusercontent.com/${repositoryOwner}/${repositoryName}/${targetCommitish}/monokle-templates.json`;
  const templateDiscoveryResponse = await fetch(templateDiscoveryUrl);
  if (!templateDiscoveryResponse.ok) {
    throw new Error("Couldn't find monokle-templates.json file in the repository");
  }
  const templateDiscovery = await templateDiscoveryResponse.json();
  if (!isTemplateDiscovery(templateDiscovery)) {
    throw new Error('The monokle-templates.json file is not valid.');
  }
  return templateDiscovery;
}

const parseTemplate = (template: AnyTemplate, templateFolderPath: string): AnyTemplate => {
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
