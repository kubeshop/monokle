import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {set} from 'lodash';

import {ValidationIntegrationId} from '@shared/models/integrations';
import {SelectedProblem, ValidationState} from '@shared/models/validation';
import electronStore from '@shared/utils/electronStore';

import {validationInitialState} from './validation.initialState';
import {pluginMetadataSelector, pluginRulesSelector} from './validation.selectors';
import {loadValidation, validateResources} from './validation.thunks';

export const validationSlice = createSlice({
  name: 'validation',
  initialState: validationInitialState,
  reducers: {
    clearValidation: (state: Draft<ValidationState>) => {
      state.lastResponse = undefined;
    },

    setSelectedProblem: (state: Draft<ValidationState>, action: PayloadAction<SelectedProblem>) => {
      state.validationOverview.selectedProblem = action.payload;
    },

    setConfigK8sSchemaVersion: (state: Draft<ValidationState>, action: PayloadAction<string>) => {
      set(state, ['config', 'settings', 'kubernetes-schema', 'schemaVersion'], action.payload);
      electronStore.set('validation.config.settings.kubernetes-schema.schemaVersion', action.payload);
      state.validationOverview.newProblemsIntroducedType = 'k8s-schema';
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

    builder.addCase(validateResources.fulfilled, (state, action) => {
      if (action.payload) {
        // @ts-ignore
        state.lastResponse = action.payload;
      }
    });
  },
});

export const {clearValidation, setConfigK8sSchemaVersion, setSelectedProblem, toggleRule, toggleValidation} =
  validationSlice.actions;
export default validationSlice.reducer;
