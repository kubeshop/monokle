import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import electronStore from '@utils/electronStore';

import {ValidationIntegrationId, ValidationSliceState} from '@monokle-desktop/shared/models';
import {DEFAULT_TRIVY_PLUGIN, RuleMap} from '@monokle/validation';

import {validationInitialState} from './validation.initialState';
import {VALIDATOR} from './validation.services';
import {loadValidation} from './validation.thunks';

export const validationSlice = createSlice({
  name: 'validation',
  initialState: validationInitialState,
  reducers: {
    clearValidation: (state: Draft<ValidationSliceState>) => {
      state.lastResponse = undefined;
    },

    toggleOPARules: (
      state: Draft<ValidationSliceState>,
      action: PayloadAction<{ruleName?: string; enable?: boolean}>
    ) => {
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

    toggleValidation: (state: Draft<ValidationSliceState>, action: PayloadAction<ValidationIntegrationId>) => {
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
  },
});

export const {clearValidation, toggleOPARules, toggleValidation} = validationSlice.actions;
export default validationSlice.reducer;
