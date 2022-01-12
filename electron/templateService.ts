import path from 'path';

import {AnyTemplate, TemplateDiscovery, isHelmChartTemplate, validateTemplateDiscovery} from '@models/template';

import downloadExtension from './extensions/downloadExtension';
import downloadExtensionEntry from './extensions/downloadExtensionEntry';
import {extractRepositoryOwnerAndNameFromUrl} from './utils';

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

const parseTemplateDiscovery = (
  templateDiscovery: TemplateDiscovery,
  templateDiscoveryFolderPath: string
): TemplateDiscovery => {
  return {
    ...templateDiscovery,
    templates: templateDiscovery.templates.map(templatePreview => {
      return {
        ...templatePreview,
        path: path.join(templateDiscoveryFolderPath, templatePreview.path),
      };
    }),
  };
};

export async function downloadTemplateDiscoveryEntry(repositoryUrl: string, templatesDir: string) {
  const {repositoryOwner, repositoryName} = extractRepositoryOwnerAndNameFromUrl(repositoryUrl);
  const templateDiscoveryUrl = `https://raw.githubusercontent.com/${repositoryOwner}/${repositoryName}/main/monokle-templates.json`;
  const templateDiscovery: TemplateDiscovery = await downloadExtensionEntry<TemplateDiscovery>({
    entryFileName: 'monokle-templates.json',
    entryFileUrl: templateDiscoveryUrl,
    validateEntryFileContent: validateTemplateDiscovery,
    parseEntryFileContent: JSON.parse,
    makeExtensionFolderPath: () => {
      return path.join(templatesDir, `${repositoryOwner}-${repositoryName}`);
    },
  });
  return templateDiscovery;
}

export async function downloadTemplateDiscovery(repositoryUrl: string, templatesDir: string) {
  const {repositoryOwner, repositoryName} = extractRepositoryOwnerAndNameFromUrl(repositoryUrl);
  const templateDiscoveryUrl = `https://raw.githubusercontent.com/${repositoryOwner}/${repositoryName}/main/monokle-templates.json`;
  const templateDiscoveryTarballUrl = `https://api.github.com/repos/${repositoryOwner}/${repositoryName}/tarball/main`;
  const templateDiscoveryFolderPath = path.join(templatesDir, `${repositoryOwner}-${repositoryName}`);
  const templateDiscovery: TemplateDiscovery = await downloadExtension<TemplateDiscovery, TemplateDiscovery>({
    extensionTarballUrl: templateDiscoveryTarballUrl,
    entryFileName: 'monokle-templates.json',
    entryFileUrl: templateDiscoveryUrl,
    validateEntryFileContent: validateTemplateDiscovery,
    parseEntryFileContent: JSON.parse,
    makeExtensionFolderPath: () => {
      return templateDiscoveryFolderPath;
    },
    transformEntryFileContentToExtension: td => parseTemplateDiscovery(td, templateDiscoveryFolderPath),
  });
  return templateDiscovery;
}
