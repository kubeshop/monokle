import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {pick, set} from 'lodash';

import {connectCluster} from '@redux/cluster/thunks/connect';
import {stopClusterConnection} from '@redux/thunks/cluster';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {ValidationFiltersValueType} from '@monokle/components';
import type {PolicyData} from '@monokle/synchronizer';
import {CORE_PLUGINS, PluginMetadataWithConfig} from '@monokle/validation';
import {SelectedProblem, ValidationState} from '@shared/models/validation';
import {CustomValidationPlugin} from '@shared/models/validationPlugins';
import electronStore from '@shared/utils/electronStore';

import {validationInitialState} from './validation.initialState';
import {pluginMetadataSelector, pluginRulesSelector} from './validation.selectors';
import {loadValidation, validateResources} from './validation.thunks';

export const validationSlice = createSlice({
  name: 'validation',
  initialState: validationInitialState,
  reducers: {
    changeRuleLevel: (
      state: Draft<ValidationState>,
      action: PayloadAction<{plugin: string; rule: string; level: 'default' | 'warning' | 'error'}>
    ) => {
      const {payload} = action;

      const config = state.config;
      const pluginName = payload.plugin;

      const pluginMetadata = pluginMetadataSelector(state, pluginName);
      const pluginRules = pluginRulesSelector(state, payload.plugin);

      if (!pluginMetadata) {
        return;
      }

      if (!config.rules) {
        config.rules = {};
      }

      const isEnabled = pluginRules.find(r => r.name === payload.rule)?.configuration.enabled ?? false;

      if (!isEnabled) {
        return;
      }

      const ruleName = `${pluginMetadata.name}/${payload.rule}`;
      const ruleValue = payload.level === 'default' ? true : payload.level === 'error' ? 'err' : 'warn';

      config.rules[ruleName] = ruleValue;

      // optimistic update of rule metadata
      const rule = state.rules?.[pluginMetadata.name]?.find(r => r.name === payload.rule);
      if (rule) {
        rule.configuration.level =
          ruleValue === true
            ? rule.defaultConfiguration?.level ?? 'warning'
            : ruleValue === 'err'
            ? 'error'
            : 'warning';
      }

      electronStore.set('validation.config.rules', config.rules);
    },

    clearValidation: (state: Draft<ValidationState>) => {
      state.lastResponse = undefined;
    },

    setValidationFilters: (state: Draft<ValidationState>, action: PayloadAction<ValidationFiltersValueType>) => {
      state.validationOverview.filters = action.payload;
    },

    setSelectedProblem: (state: Draft<ValidationState>, action: PayloadAction<SelectedProblem>) => {
      state.validationOverview.selectedProblem = action.payload;
    },

    setConfigK8sSchemaVersion: (state: Draft<ValidationState>, action: PayloadAction<string>) => {
      set(state, ['config', 'settings', 'kubernetes-schema', 'schemaVersion'], action.payload);
      electronStore.set('validation.config.settings.kubernetes-schema.schemaVersion', action.payload);
      state.validationOverview.newProblemsIntroducedType = 'k8s-schema';
    },

    updateSelectedPluginConfiguration: (
      state: Draft<ValidationState>,
      action: PayloadAction<CustomValidationPlugin | PluginMetadataWithConfig | undefined>
    ) => {
      state.configure.plugin = action.payload;
    },

    toggleRule: (
      state: Draft<ValidationState>,
      action: PayloadAction<{plugin: string; rule?: string; enable?: boolean}>
    ) => {
      const {payload} = action;

      const config = state.config;
      const pluginName = payload.plugin;

      const pluginMetadata = pluginMetadataSelector(state, pluginName);
      const pluginRules = pluginRulesSelector(state, payload.plugin);

      if (!pluginMetadata) {
        return;
      }

      if (!config.rules) {
        config.rules = {};
      }

      if (payload.rule === undefined) {
        // toggle all rules
        const enable = payload.enable ?? true;

        if (enable) {
          pluginRules.forEach(rule => {
            const ruleName = `${pluginMetadata.name}/${rule.name}`;
            if (config.rules) config.rules[ruleName] = true;
          });
        } else {
          pluginRules.forEach(rule => {
            const ruleName = `${pluginMetadata.name}/${rule.name}`;
            if (config.rules) config.rules[ruleName] = false;
          });
        }
      } else {
        // toggle given rule
        const ruleName = `${pluginMetadata.name}/${payload.rule}`;
        const shouldToggle = payload.enable === undefined;
        const isEnabled = pluginRules.find(r => r.name === payload.rule)?.configuration.enabled ?? false;
        const enabled = shouldToggle ? !isEnabled : Boolean(payload.enable);
        config.rules[ruleName] = enabled;

        // optimistic update of rule metadata
        const rule = state.rules?.[pluginMetadata.name]?.find(r => r.name === payload.rule);
        if (rule) {
          rule.configuration.enabled = enabled;
        }
      }

      state.validationOverview.newProblemsIntroducedType = 'rule';
      electronStore.set('validation.config.rules', config.rules);
    },

    toggleValidation: (state: Draft<ValidationState>, action: PayloadAction<string>) => {
      const id = action.payload;

      if (!state.config.plugins) {
        state.config.plugins = {[id]: true};
      } else {
        const previousValue = Boolean(state.config.plugins[id]);
        state.config.plugins[id] = !previousValue;
      }

      state.validationOverview.newProblemsIntroducedType = 'rule';
      electronStore.set('validation.config.plugins', state.config.plugins);
    },

    addValidationPlugin(state, {payload}: PayloadAction<{plugin: string; enable?: boolean}>) {
      if (!state.config.plugins) state.config.plugins = {};
      state.config.plugins[payload.plugin] = payload.enable ?? false;
    },

    removeValidationPlugin(state, {payload}: PayloadAction<{plugin: string} | undefined>) {
      if (!state.config.plugins) return;

      if (payload) {
        // Remove given plugin
        delete state.config.plugins[payload.plugin];
      } else {
        // Remove all custom plugins
        state.config.plugins = pick(state.config.plugins, CORE_PLUGINS);
      }
    },

    setCloudPolicy(state, {payload}: PayloadAction<PolicyData>) {
      state.cloudPolicy = payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(setRootFolder.fulfilled, state => {
      state.validationOverview.selectedProblem = undefined;
      state.lastResponse = undefined;
      state.validationOverview.newProblemsIntroducedType = 'initial';
    });

    builder.addCase(loadValidation.pending, (state, {meta}) => {
      if (state.loadRequestId) return;
      state.status = 'loading';
      state.loadRequestId = meta.requestId;
    });

    builder.addCase(loadValidation.rejected, state => {
      state.status = 'error';
      state.loadRequestId = undefined;
    });

    builder.addCase(loadValidation.fulfilled, (state, {payload}) => {
      state.status = 'loaded';
      if (!payload) {
        return;
      }
      state.metadata = payload.metadata;
      state.rules = payload.rules as any; // See NOTE_TS
    });

    builder.addCase(validateResources.pending, state => {
      state.status = 'loading';
    });

    builder.addCase(validateResources.rejected, state => {
      state.status = 'error';
      state.lastResponse = undefined;
      state.loadRequestId = undefined;
    });

    builder.addCase(validateResources.fulfilled, (state, action) => {
      if (action.payload) {
        state.lastResponse = action.payload;
      }
      state.status = 'loaded';
    });

    builder
      .addCase(stopClusterConnection.fulfilled, state => {
        state.validationOverview.selectedProblem = undefined;
      })
      .addCase(connectCluster.fulfilled, state => {
        state.validationOverview.selectedProblem = undefined;
      });
  },
});

export const {
  changeRuleLevel,
  clearValidation,
  setConfigK8sSchemaVersion,
  setValidationFilters,
  setSelectedProblem,
  toggleRule,
  toggleValidation,
  updateSelectedPluginConfiguration,
  addValidationPlugin,
  removeValidationPlugin,
  setCloudPolicy,
} = validationSlice.actions;
export default validationSlice.reducer;
