import asyncLib from 'async';
import log from 'loglevel';
import path from 'path';

import {AnyPlugin, isBundledTemplatePluginModule} from '@models/plugin';
import {
  AnyTemplate,
  TemplatePack,
  isHelmChartTemplate,
  validateAnyTemplate,
  validateTemplatePack,
} from '@models/template';

import downloadExtension from './extensions/downloadExtension';
import {createFolder, doesPathExist} from './extensions/fileSystem';
import loadExtension from './extensions/loadExtension';
import loadMultipleExtensions from './extensions/loadMultipleExtensions';
import {extractRepositoryOwnerAndNameFromUrl} from './utils';

const TEMPLATE_PACK_ENTRY_FILE_NAME = 'monokle-template-pack.json';
const TEMPLATE_ENTRY_FILE_NAME = 'monokle-template.json';

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
  const templatePackUrl = `https://raw.githubusercontent.com/${repositoryOwner}/${repositoryName}/main/${TEMPLATE_PACK_ENTRY_FILE_NAME}`;
  const templatePackTarballUrl = `https://api.github.com/repos/${repositoryOwner}/${repositoryName}/tarball/main`;
  const templatePackFolderPath = path.join(templatesDir, `${repositoryOwner}-${repositoryName}`);
  const templatePack: TemplatePack = await downloadExtension<TemplatePack, TemplatePack>({
    extensionTarballUrl: templatePackTarballUrl,
    entryFileName: TEMPLATE_PACK_ENTRY_FILE_NAME,
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
  const templateUrl = `https://raw.githubusercontent.com/${repositoryOwner}/${repositoryName}/main/${TEMPLATE_ENTRY_FILE_NAME}`;
  const templateTarballUrl = `https://api.github.com/repos/${repositoryOwner}/${repositoryName}/tarball/main`;
  const templateFolderPath = path.join(templatesDir, `${repositoryOwner}-${repositoryName}`);
  const template: AnyTemplate = await downloadExtension<AnyTemplate, AnyTemplate>({
    extensionTarballUrl: templateTarballUrl,
    entryFileName: TEMPLATE_ENTRY_FILE_NAME,
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

export async function loadTemplatePacks(templatePacksDir: string) {
  try {
    const doesTemplatePacksDirExist = await doesPathExist(templatePacksDir);
    if (!doesTemplatePacksDirExist) {
      await createFolder(templatePacksDir);
    }
  } catch (e) {
    if (e instanceof Error) {
      log.warn(`[loadTemplatePacks]: Couldn't load plugins: ${e.message}`);
      return [];
    }
  }
  const templatePacks: TemplatePack[] = await loadMultipleExtensions<TemplatePack, TemplatePack>({
    folderPath: templatePacksDir,
    entryFileName: TEMPLATE_PACK_ENTRY_FILE_NAME,
    parseEntryFileContent: JSON.parse,
    validateEntryFileContent: validateTemplatePack,
    transformEntryFileContentToExtension: parseTemplatePack,
  });
  return templatePacks;
}

const makeLoadTemplateOptions = (folderPath: string) => {
  return {
    folderPath,
    entryFileName: TEMPLATE_ENTRY_FILE_NAME,
    parseEntryFileContent: JSON.parse,
    validateEntryFileContent: validateAnyTemplate,
    transformEntryFileContentToExtension: parseTemplate,
  };
};

async function loadTemplatesFromPaths(paths: string[]): Promise<AnyTemplate[]> {
  const bundledTemplates: AnyTemplate[] = await asyncLib.map(paths, async templatePath => {
    const template = await loadExtension(makeLoadTemplateOptions(templatePath));
    return template;
  });
  return bundledTemplates.filter((bt): bt is AnyTemplate => bt !== undefined);
}

export function loadTemplatesFromPlugin(plugin: AnyPlugin): Promise<AnyTemplate[]> {
  return loadTemplatesFromPaths(
    plugin.modules.filter(isBundledTemplatePluginModule).map(m => {
      return m.path;
    })
  );
}

export function loadTemplatesFromTemplatePack(templatePack: TemplatePack): Promise<AnyTemplate[]> {
  return loadTemplatesFromPaths(
    templatePack.templates.map(t => {
      return t.path;
    })
  );
}

type LoadTemplatesOptions = {templatePacks: TemplatePack[]; plugins: AnyPlugin[]};
export async function loadTemplates(templatesDir: string, options: LoadTemplatesOptions) {
  const {templatePacks, plugins} = options;

  let standaloneTemplates: AnyTemplate[] = [];
  try {
    const doesTemplatesDirExist = await doesPathExist(templatesDir);
    if (!doesTemplatesDirExist) {
      await createFolder(templatesDir);
    }
    standaloneTemplates = await loadMultipleExtensions<AnyTemplate, AnyTemplate>(makeLoadTemplateOptions(templatesDir));
  } catch (e) {
    if (e instanceof Error) {
      log.warn(`[loadTemplatePacks]: Couldn't load plugins: ${e.message}`);
      return [];
    }
  }

  const templatePacksBundledTemplates: AnyTemplate[][] = await asyncLib.map(templatePacks, async templatePack => {
    const bundledTemplates = await loadTemplatesFromTemplatePack(templatePack);
    return bundledTemplates;
  });

  const pluginsBundledTemplates: AnyTemplate[][] = await asyncLib.map(plugins, async plugin => {
    const bundledTemplates = await loadTemplatesFromPlugin(plugin);
    return bundledTemplates;
  });

  const bundledTemplates: AnyTemplate[] = [...templatePacksBundledTemplates.flat(), ...pluginsBundledTemplates.flat()];
  return [...standaloneTemplates, ...bundledTemplates];
}
