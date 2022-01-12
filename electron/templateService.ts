import path from 'path';

import {AnyPlugin} from '@models/plugin';
import {AnyTemplate, TemplatePack, isHelmChartTemplate, validateTemplatePack} from '@models/template';

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

const parseTemplatePack = (templatePack: TemplatePack, templatePackFolderPath: string): TemplatePack => {
  return {
    ...templatePack,
    templates: templatePack.templates.map(templatePreview => {
      return {
        ...templatePreview,
        path: path.join(templatePackFolderPath, templatePreview.path),
      };
    }),
  };
};

export async function downloadTemplateDiscoveryEntry(repositoryUrl: string, templatesDir: string) {
  const {repositoryOwner, repositoryName} = extractRepositoryOwnerAndNameFromUrl(repositoryUrl);
  const templateDiscoveryUrl = `https://raw.githubusercontent.com/${repositoryOwner}/${repositoryName}/main/monokle-templates.json`;
  const templateDiscovery: TemplatePack = await downloadExtensionEntry<TemplatePack>({
    entryFileName: 'monokle-templates.json',
    entryFileUrl: templateDiscoveryUrl,
    validateEntryFileContent: validateTemplatePack,
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
  const templatePackFolderPath = path.join(templatesDir, `${repositoryOwner}-${repositoryName}`);
  const templateDiscovery: TemplatePack = await downloadExtension<TemplatePack, TemplatePack>({
    extensionTarballUrl: templateDiscoveryTarballUrl,
    entryFileName: 'monokle-templates.json',
    entryFileUrl: templateDiscoveryUrl,
    validateEntryFileContent: validateTemplatePack,
    parseEntryFileContent: JSON.parse,
    makeExtensionFolderPath: () => {
      return templatePackFolderPath;
    },
    transformEntryFileContentToExtension: td => parseTemplatePack(td, templatePackFolderPath),
  });
  return templateDiscovery;
}

type LoadTemplatesOptions = {templatePacks: TemplatePack[]; plugins: AnyPlugin[]};
export async function loadTemplates(templatesDir: string, options: LoadTemplatesOptions) {
  // TODO: load templates from the templatesDir
  // TODO: load templates from templatePacks and plugins
}
