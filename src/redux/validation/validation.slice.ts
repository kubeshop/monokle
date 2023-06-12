import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {set} from 'lodash';

import {connectCluster} from '@redux/cluster/thunks/connect';
import {stopClusterConnection} from '@redux/thunks/cluster';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {ValidationFiltersValueType} from '@monokle/components';
import {ValidationIntegration, ValidationIntegrationId} from '@shared/models/integrations';
import {SelectedProblem, ValidationState} from '@shared/models/validation';
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

      // @ts-ignore
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

    updateIntegration: (state: Draft<ValidationState>, action: PayloadAction<ValidationIntegration | undefined>) => {
      state.configure.integration = action.payload;
    },

    toggleRule: (
      state: Draft<ValidationState>,
      action: PayloadAction<{plugin: string; rule?: string; enable?: boolean}>
    ) => {
      const {payload} = action;

      const config = state.config;
      const pluginName = payload.plugin;

      // @ts-ignore
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
            // @ts-ignore
            config.rules[ruleName] = true;
          });
        } else {
          pluginRules.forEach(rule => {
            const ruleName = `${pluginMetadata.name}/${rule.name}`;
            // @ts-ignore
            config.rules[ruleName] = false;
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

    toggleValidation: (state: Draft<ValidationState>, action: PayloadAction<ValidationIntegrationId>) => {
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
        // @ts-ignore
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
  updateIntegration,
} = validationSlice.actions;
export default validationSlice.reducer;
