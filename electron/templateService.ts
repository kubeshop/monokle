import asyncLib from 'async';
import log from 'loglevel';
import path from 'path';
import semver from 'semver';

import {AnyExtension} from '@models/extension';
import {AnyPlugin, isBundledTemplatePluginModule} from '@models/plugin';
import {
  AnyTemplate,
  TemplatePack,
  isHelmChartTemplate,
  validateAnyTemplate,
  validateTemplatePack,
} from '@models/template';

import downloadExtension from './extensions/downloadExtension';
import downloadExtensionEntry from './extensions/downloadExtensionEntry';
import {createFolder, doesPathExist} from './extensions/fileSystem';
import loadExtension from './extensions/loadExtension';
import loadMultipleExtensions from './extensions/loadMultipleExtensions';
import {convertExtensionsToRecord, makeExtensionDownloadData} from './utils';

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

export async function downloadTemplatePack(
  repositoryUrl: string,
  templatePacksDir: string
): Promise<AnyExtension<TemplatePack>> {
  const {entryFileUrl, tarballUrl, folderPath} = makeExtensionDownloadData(
    repositoryUrl,
    TEMPLATE_PACK_ENTRY_FILE_NAME,
    templatePacksDir
  );
  const templatePack: TemplatePack = await downloadExtension<TemplatePack, TemplatePack>({
    extensionTarballUrl: tarballUrl,
    entryFileName: TEMPLATE_PACK_ENTRY_FILE_NAME,
    entryFileUrl,
    validateEntryFileContent: validateTemplatePack,
    parseEntryFileContent: JSON.parse,
    makeExtensionFolderPath: () => {
      return folderPath;
    },
    transformEntryFileContentToExtension: tp => parseTemplatePack(tp, folderPath),
  });
  return {extension: templatePack, folderPath};
}

export async function downloadTemplate(
  repositoryUrl: string,
  templatesDir: string
): Promise<AnyExtension<AnyTemplate>> {
  const {entryFileUrl, tarballUrl, folderPath} = makeExtensionDownloadData(
    repositoryUrl,
    TEMPLATE_ENTRY_FILE_NAME,
    templatesDir
  );
  const template: AnyTemplate = await downloadExtension<AnyTemplate, AnyTemplate>({
    extensionTarballUrl: tarballUrl,
    entryFileName: TEMPLATE_ENTRY_FILE_NAME,
    entryFileUrl,
    validateEntryFileContent: validateAnyTemplate,
    parseEntryFileContent: JSON.parse,
    makeExtensionFolderPath: () => {
      return folderPath;
    },
    transformEntryFileContentToExtension: t => parseTemplate(t, folderPath),
  });
  return {extension: template, folderPath};
}

export async function loadTemplatePackMap(templatePacksDir: string): Promise<Record<string, TemplatePack>> {
  try {
    const doesTemplatePacksDirExist = await doesPathExist(templatePacksDir);
    if (!doesTemplatePacksDirExist) {
      await createFolder(templatePacksDir);
    }
  } catch (e) {
    if (e instanceof Error) {
      log.warn(`[loadTemplatePacks]: Couldn't load plugins: ${e.message}`);
      return {};
    }
  }
  const templatePackExtensions: AnyExtension<TemplatePack>[] = await loadMultipleExtensions<TemplatePack, TemplatePack>(
    {
      folderPath: templatePacksDir,
      entryFileName: TEMPLATE_PACK_ENTRY_FILE_NAME,
      parseEntryFileContent: JSON.parse,
      validateEntryFileContent: validateTemplatePack,
      transformEntryFileContentToExtension: parseTemplatePack,
    }
  );
  return convertExtensionsToRecord(templatePackExtensions);
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

async function loadTemplatesFromPaths(paths: string[]): Promise<AnyExtension<AnyTemplate>[]> {
  const templateExtensions: (AnyExtension<AnyTemplate> | undefined)[] = await asyncLib.map(
    paths,
    async templatePath => {
      const extension = await loadExtension(makeLoadTemplateOptions(templatePath));
      return extension;
    }
  );
  return templateExtensions.filter((r): r is AnyExtension<AnyTemplate> => r !== undefined);
}

export function loadTemplatesFromPlugin(plugin: AnyPlugin): Promise<AnyExtension<AnyTemplate>[]> {
  return loadTemplatesFromPaths(
    plugin.modules.filter(isBundledTemplatePluginModule).map(m => {
      return m.path;
    })
  );
}

export function loadTemplatesFromTemplatePack(templatePack: TemplatePack): Promise<AnyExtension<AnyTemplate>[]> {
  return loadTemplatesFromPaths(
    templatePack.templates.map(t => {
      return t.path;
    })
  );
}

type LoadTemplatesOptions = {templatePacks: TemplatePack[]; plugins: AnyPlugin[]};
export async function loadTemplateMap(
  templatesDir: string,
  options: LoadTemplatesOptions
): Promise<Record<string, AnyTemplate>> {
  const {templatePacks, plugins} = options;

  const templateMap: Record<string, AnyTemplate> = {};

  try {
    const doesTemplatesDirExist = await doesPathExist(templatesDir);
    if (!doesTemplatesDirExist) {
      await createFolder(templatesDir);
    }
    const loadStandaloneTemplateResults = await loadMultipleExtensions<AnyTemplate, AnyTemplate>(
      makeLoadTemplateOptions(templatesDir)
    );
    loadStandaloneTemplateResults.forEach(result => {
      templateMap[result.folderPath] = result.extension;
    });
  } catch (e) {
    if (e instanceof Error) {
      log.warn(`[loadTemplatePacks]: Couldn't load standalone templates: ${e.message}`);
      return {};
    }
  }

  const templatePackExtensions: AnyExtension<AnyTemplate>[][] = await asyncLib.map(
    templatePacks,
    async templatePack => {
      const results = await loadTemplatesFromTemplatePack(templatePack);
      return results;
    }
  );

  templatePackExtensions.flat().forEach(result => {
    templateMap[result.folderPath] = result.extension;
  });

  const pluginExtensions: AnyExtension<AnyTemplate>[][] = await asyncLib.map(plugins, async plugin => {
    const results = await loadTemplatesFromPlugin(plugin);
    return results;
  });

  pluginExtensions.flat().forEach(result => {
    templateMap[result.folderPath] = result.extension;
  });

  return templateMap;
}

export async function updateTemplate(
  template: AnyTemplate,
  templatesDir: string,
  userTempDir: string
): Promise<AnyExtension<AnyTemplate> | undefined> {
  const {entryFileUrl, folderPath} = makeExtensionDownloadData(
    template.repository,
    TEMPLATE_ENTRY_FILE_NAME,
    userTempDir
  );
  const tempTemplateEntry = await downloadExtensionEntry({
    entryFileName: TEMPLATE_ENTRY_FILE_NAME,
    entryFileUrl,
    makeExtensionFolderPath: () => folderPath,
    parseEntryFileContent: JSON.parse,
    validateEntryFileContent: validateAnyTemplate,
  });
  if (semver.lt(template.version, tempTemplateEntry.version)) {
    const templateExtension = await downloadTemplate(template.repository, templatesDir);
    return templateExtension;
  }
  return undefined;
}

export async function updateTemplatePack(
  template: AnyTemplate,
  templatePacksDir: string,
  userTempDir: string
): Promise<AnyExtension<TemplatePack> | undefined> {
  const {entryFileUrl, folderPath} = makeExtensionDownloadData(
    template.repository,
    TEMPLATE_ENTRY_FILE_NAME,
    userTempDir
  );
  const tempTemplatePackEntry = await downloadExtensionEntry({
    entryFileName: TEMPLATE_PACK_ENTRY_FILE_NAME,
    entryFileUrl,
    makeExtensionFolderPath: () => folderPath,
    parseEntryFileContent: JSON.parse,
    validateEntryFileContent: validateTemplatePack,
  });
  if (semver.lt(template.version, tempTemplatePackEntry.version)) {
    const templatePackExtension = await downloadTemplatePack(template.repository, templatePacksDir);
    return templatePackExtension;
  }
  return undefined;
}
