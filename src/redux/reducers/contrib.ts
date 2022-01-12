import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {ContribState} from '@models/contrib';
import {AnyPlugin} from '@models/plugin';
import {AnyTemplate, TemplatePack} from '@models/template';

import initialState from '@redux/initialState';

export const contribSlice = createSlice({
  name: 'contrib',
  initialState: initialState.contrib,
  reducers: {
    addPlugin: (state: Draft<ContribState>, action: PayloadAction<AnyPlugin>) => {
      state.plugins.push(action.payload);
    },
    setPlugins: (state: Draft<ContribState>, action: PayloadAction<AnyPlugin[]>) => {
      state.plugins = action.payload;
      state.isLoadingExistingPlugins = false;
    },
    addTemplate: (state: Draft<ContribState>, action: PayloadAction<AnyTemplate>) => {
      state.templates.push(action.payload);
    },
    setTemplates: (state: Draft<ContribState>, action: PayloadAction<AnyTemplate[]>) => {
      state.templates = action.payload;
      state.isLoadingExistingTemplates = false;
    },
    addTemplatePack: (state: Draft<ContribState>, action: PayloadAction<TemplatePack>) => {
      state.templatePacks.push(action.payload);
    },
    setTemplatePacks: (state: Draft<ContribState>, action: PayloadAction<TemplatePack[]>) => {
      state.templatePacks = action.payload;
      state.isLoadingExistingTemplatePacks = false;
    },
  },
});

export const {addPlugin, setPlugins, addTemplate, setTemplates, addTemplatePack, setTemplatePacks} =
  contribSlice.actions;
export default contribSlice.reducer;
