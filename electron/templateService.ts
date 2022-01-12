import path from 'path';

import {AnyPlugin} from '@models/plugin';
import {
  AnyTemplate,
  TemplatePack,
  isHelmChartTemplate,
  validateAnyTemplate,
  validateTemplatePack,
} from '@models/template';

import downloadExtension from './extensions/downloadExtension';
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

export async function downloadTemplatePack(repositoryUrl: string, templatesDir: string) {
  const {repositoryOwner, repositoryName} = extractRepositoryOwnerAndNameFromUrl(repositoryUrl);
  const templatePackUrl = `https://raw.githubusercontent.com/${repositoryOwner}/${repositoryName}/main/monokle-template-pack.json`;
  const templatePackTarballUrl = `https://api.github.com/repos/${repositoryOwner}/${repositoryName}/tarball/main`;
  const templatePackFolderPath = path.join(templatesDir, `${repositoryOwner}-${repositoryName}`);
  const templatePack: TemplatePack = await downloadExtension<TemplatePack, TemplatePack>({
    extensionTarballUrl: templatePackTarballUrl,
    entryFileName: 'monokle-template-pack.json',
    entryFileUrl: templatePackUrl,
    validateEntryFileContent: validateTemplatePack,
    parseEntryFileContent: JSON.parse,
    makeExtensionFolderPath: () => {
      return templatePackFolderPath;
    },
    transformEntryFileContentToExtension: tp => parseTemplatePack(tp, templatePackFolderPath),
  });
  return templatePack;
}

export async function downloadTemplate(repositoryUrl: string, templatesDir: string) {
  const {repositoryOwner, repositoryName} = extractRepositoryOwnerAndNameFromUrl(repositoryUrl);
  const templateUrl = `https://raw.githubusercontent.com/${repositoryOwner}/${repositoryName}/main/monokle-template.json`;
  const templateTarballUrl = `https://api.github.com/repos/${repositoryOwner}/${repositoryName}/tarball/main`;
  const templateFolderPath = path.join(templatesDir, `${repositoryOwner}-${repositoryName}`);
  const template: AnyTemplate = await downloadExtension<AnyTemplate, AnyTemplate>({
    extensionTarballUrl: templateTarballUrl,
    entryFileName: 'monokle-template.json',
    entryFileUrl: templateUrl,
    validateEntryFileContent: validateAnyTemplate,
    parseEntryFileContent: JSON.parse,
    makeExtensionFolderPath: () => {
      return templateFolderPath;
    },
    transformEntryFileContentToExtension: t => parseTemplate(t, templateFolderPath),
  });
  return template;
}

type LoadTemplatesOptions = {templatePacks: TemplatePack[]; plugins: AnyPlugin[]};
export async function loadTemplates(templatesDir: string, options: LoadTemplatesOptions) {
  // TODO: load templates from the templatesDir
  // TODO: load templates from templatePacks and plugins
}
