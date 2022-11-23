import {isAnyOf} from '@reduxjs/toolkit';

import {AppListenerFn} from '@redux/listeners/base';

import {toggleOPARules, toggleValidation} from './validation.slice';
import {loadValidation} from './validation.thunks';

const reloadListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(toggleOPARules, toggleValidation),
    async effect(_action, {dispatch}) {
      await dispatch(loadValidation());
    },
  });
};

export const validationListeners = [reloadListener];
