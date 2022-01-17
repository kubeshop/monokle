import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {AnyExtension, ExtensionState} from '@models/extension';
import {AnyPlugin} from '@models/plugin';
import {AnyTemplate, TemplatePack} from '@models/template';

import initialState from '@redux/initialState';

export const extensionSlice = createSlice({
  name: 'extension',
  initialState: initialState.extension,
  reducers: {
    addPlugin: (state: Draft<ExtensionState>, action: PayloadAction<AnyExtension<AnyPlugin>>) => {
      const {extension, folderPath} = action.payload;
      state.pluginMap[folderPath] = extension;
    },
    setPluginMap: (state: Draft<ExtensionState>, action: PayloadAction<Record<string, AnyPlugin>>) => {
      state.pluginMap = action.payload;
      state.isLoadingExistingPlugins = false;
    },
    addTemplate: (state: Draft<ExtensionState>, action: PayloadAction<AnyExtension<AnyTemplate>>) => {
      const {folderPath, extension} = action.payload;
      state.templateMap[folderPath] = extension;
    },
    removeTemplate: (state: Draft<ExtensionState>, action: PayloadAction<string>) => {
      const folderPath = action.payload;
      delete state.templateMap[folderPath];
    },
    addMultipleTemplates: (state: Draft<ExtensionState>, action: PayloadAction<AnyExtension<AnyTemplate>[]>) => {
      action.payload.forEach(current => {
        const {folderPath, extension} = current;
        state.templateMap[folderPath] = extension;
      });
    },
    removeMultipleTemplates: (state: Draft<ExtensionState>, action: PayloadAction<string[]>) => {
      action.payload.forEach(templateFolderPath => {
        delete state.templateMap[templateFolderPath];
      });
    },
    setTemplateMap: (state: Draft<ExtensionState>, action: PayloadAction<Record<string, AnyTemplate>>) => {
      state.templateMap = action.payload;
      state.isLoadingExistingTemplates = false;
    },
    addTemplatePack: (state: Draft<ExtensionState>, action: PayloadAction<AnyExtension<TemplatePack>>) => {
      const {folderPath, extension} = action.payload;
      state.templatePackMap[folderPath] = extension;
    },
    removeTemplatePack: (state: Draft<ExtensionState>, action: PayloadAction<string>) => {
      const folderPath = action.payload;
      delete state.templatePackMap[folderPath];
    },
    setTemplatePackMap: (state: Draft<ExtensionState>, action: PayloadAction<Record<string, TemplatePack>>) => {
      state.templatePackMap = action.payload;
      state.isLoadingExistingTemplatePacks = false;
    },
    setExtensionsDirs: (
      state: Draft<ExtensionState>,
      action: PayloadAction<{templatesDir: string; templatePacksDir: string; pluginsDir: string}>
    ) => {
      state.templatesDir = action.payload.templatesDir;
      state.templatePacksDir = action.payload.templatePacksDir;
      state.pluginsDir = action.payload.pluginsDir;
    },
  },
});

export const {
  addPlugin,
  setPluginMap,
  addTemplate,
  removeTemplate,
  addMultipleTemplates,
  setTemplateMap,
  addTemplatePack,
  setTemplatePackMap,
  setExtensionsDirs,
} = extensionSlice.actions;
export default extensionSlice.reducer;
