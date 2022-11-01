import {createSelector} from '@reduxjs/toolkit';

import {RootState} from '@models/rootstate';

import {VALIDATOR} from './validation.services';

export const pluginEnabledSelector = createSelector(
  (state: RootState, id: string) => state.validation.config?.plugins?.[id],
  (_: RootState, id: string) => id,
  (_config, id): boolean => VALIDATOR.isPluginEnabled(id)
);
