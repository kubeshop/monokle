import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {AnyExtension, ExtensionState} from '@models/extension';
import {AnyPlugin} from '@models/plugin';
import {AnyTemplate, TemplatePack} from '@models/template';

import initialState from '@redux/initialState';

export const extensionSlice = createSlice({
  name: 'extension',
  initialState: initialState.extension,
  reducers: {
    addMultiplePlugins: (state: Draft<ExtensionState>, action: PayloadAction<AnyExtension<AnyPlugin>[]>) => {
      action.payload.forEach(current => {
        const {folderPath, extension} = current;
        state.pluginMap[folderPath] = extension;
      });
    },
    addMultipleTemplates: (state: Draft<ExtensionState>, action: PayloadAction<AnyExtension<AnyTemplate>[]>) => {
      action.payload.forEach(current => {
        const {folderPath, extension} = current;
        state.templateMap[folderPath] = extension;
      });
    },
    addPlugin: (state: Draft<ExtensionState>, action: PayloadAction<AnyExtension<AnyPlugin>>) => {
      const {extension, folderPath} = action.payload;
      state.pluginMap[folderPath] = extension;
    },
    addMultipleTemplatePacks: (state: Draft<ExtensionState>, action: PayloadAction<AnyExtension<TemplatePack>[]>) => {
      action.payload.forEach(current => {
        const {folderPath, extension} = current;
        state.templatePackMap[folderPath] = extension;
      });
    },
    addTemplate: (state: Draft<ExtensionState>, action: PayloadAction<AnyExtension<AnyTemplate>>) => {
      const {folderPath, extension} = action.payload;
      state.templateMap[folderPath] = extension;
    },
    addTemplatePack: (state: Draft<ExtensionState>, action: PayloadAction<AnyExtension<TemplatePack>>) => {
      const {folderPath, extension} = action.payload;
      state.templatePackMap[folderPath] = extension;
    },
    closePluginsDrawer: (state: Draft<ExtensionState>) => {
      state.isPluginsDrawerVisible = false;
    },
    openPluginsDrawer: (state: Draft<ExtensionState>) => {
      state.isPluginsDrawerVisible = true;
    },
    removePlugin: (state: Draft<ExtensionState>, action: PayloadAction<string>) => {
      const folderPath = action.payload;
      delete state.pluginMap[folderPath];
    },
    removeMultipleTemplates: (state: Draft<ExtensionState>, action: PayloadAction<string[]>) => {
      action.payload.forEach(templateFolderPath => {
        delete state.templateMap[templateFolderPath];
      });
    },
    removeTemplate: (state: Draft<ExtensionState>, action: PayloadAction<string>) => {
      const folderPath = action.payload;
      delete state.templateMap[folderPath];
    },
    removeTemplatePack: (state: Draft<ExtensionState>, action: PayloadAction<string>) => {
      const folderPath = action.payload;
      delete state.templatePackMap[folderPath];
    },
    setPluginMap: (state: Draft<ExtensionState>, action: PayloadAction<Record<string, AnyPlugin>>) => {
      state.pluginMap = action.payload;
      state.isLoadingExistingPlugins = false;
    },
    setTemplateMap: (state: Draft<ExtensionState>, action: PayloadAction<Record<string, AnyTemplate>>) => {
      state.templateMap = action.payload;
      state.isLoadingExistingTemplates = false;
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
  removePlugin,
  addMultiplePlugins,
  setPluginMap,
  addTemplate,
  removeTemplate,
  addMultipleTemplates,
  setTemplateMap,
  addTemplatePack,
  removeTemplatePack,
  addMultipleTemplatePacks,
  setTemplatePackMap,
  setExtensionsDirs,
  openPluginsDrawer,
  closePluginsDrawer,
} = extensionSlice.actions;
export default extensionSlice.reducer;
