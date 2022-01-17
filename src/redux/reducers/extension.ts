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
    addMultiplePlugins: (state: Draft<ExtensionState>, action: PayloadAction<AnyExtension<AnyPlugin>[]>) => {
      action.payload.forEach(current => {
        const {folderPath, extension} = current;
        state.pluginMap[folderPath] = extension;
      });
    },
    setPluginMap: (state: Draft<ExtensionState>, action: PayloadAction<Record<string, AnyPlugin>>) => {
      state.pluginMap = action.payload;
      state.isLoadingExistingPlugins = false;
    },
    addTemplate: (state: Draft<ExtensionState>, action: PayloadAction<AnyExtension<AnyTemplate>>) => {
      const {folderPath, extension} = action.payload;
      state.templateMap[folderPath] = extension;
    },
    addMultipleTemplates: (state: Draft<ExtensionState>, action: PayloadAction<AnyExtension<AnyTemplate>[]>) => {
      action.payload.forEach(current => {
        const {folderPath, extension} = current;
        state.templateMap[folderPath] = extension;
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
    addMultipleTemplatePacks: (state: Draft<ExtensionState>, action: PayloadAction<AnyExtension<TemplatePack>[]>) => {
      action.payload.forEach(current => {
        const {folderPath, extension} = current;
        state.templatePackMap[folderPath] = extension;
      });
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
  addMultiplePlugins,
  setPluginMap,
  addTemplate,
  addMultipleTemplates,
  setTemplateMap,
  addTemplatePack,
  addMultipleTemplatePacks,
  setTemplatePackMap,
  setExtensionsDirs,
} = extensionSlice.actions;
export default extensionSlice.reducer;
