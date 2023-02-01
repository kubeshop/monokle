import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {DEFAULT_TRIVY_PLUGIN, RuleMap} from '@monokle/validation';
import {ValidationIntegrationId} from '@shared/models/integrations';
import {ValidationState} from '@shared/models/validation';
import electronStore from '@shared/utils/electronStore';

import {validationInitialState} from './validation.initialState';
import {VALIDATOR} from './validation.services';
import {loadValidation, validateResources} from './validation.thunks';

export const validationSlice = createSlice({
  name: 'validation',
  initialState: validationInitialState,
  reducers: {
    clearValidation: (state: Draft<ValidationState>) => {
      state.lastResponse = undefined;
    },

    toggleOPARules: (state: Draft<ValidationState>, action: PayloadAction<{ruleName?: string; enable?: boolean}>) => {
      const {payload} = action;

      if (!state.config.rules) {
        state.config.rules = {};
      }

      if (payload.ruleName === undefined) {
        // toggle all rules
        const enable = payload.enable ?? true;

        const rules: RuleMap = {};

        DEFAULT_TRIVY_PLUGIN.rules.forEach(rule => {
          const ruleName = `open-policy-agent/${rule.name}`;
          rules[ruleName] = Boolean(enable);
        });

        state.config.rules = rules;
      } else {
        // toggle given rule
        const ruleName = payload.ruleName;
        const shouldToggle = payload.enable === undefined;
        const isEnabled = VALIDATOR.isRuleEnabled(ruleName);
        const enable = shouldToggle ? !isEnabled : payload.enable;
        state.config.rules[ruleName] = Boolean(enable);
      }

      electronStore.set('validation.config.rules', state.config.rules);
    },

    toggleValidation: (state: Draft<ValidationState>, action: PayloadAction<ValidationIntegrationId>) => {
      const id = action.payload;

      if (!state.config.plugins) {
        state.config.plugins = {[id]: true};
      } else {
        const previousValue = Boolean(state.config.plugins[id]);
        state.config.plugins[id] = !previousValue;
      }

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

    builder.addCase(loadValidation.fulfilled, (state, {meta}) => {
      if (state.loadRequestId !== meta.requestId) return;
      state.status = 'loaded';
      state.loadRequestId = undefined;
    });

    builder.addCase(validateResources.fulfilled, (state, action) => {
      if (action.payload) {
        // @ts-ignore
        state.lastResponse = action.payload;
      }
    });
  },
});

export const {clearValidation, toggleOPARules, toggleValidation} = validationSlice.actions;
export default validationSlice.reducer;
