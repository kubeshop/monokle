import {isAnyOf} from '@reduxjs/toolkit';

import {AppListenerFn} from '@redux/listeners/base';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {toggleOPARules, toggleValidation} from './validation.slice';
import {loadValidation, validateResources} from './validation.thunks';

const loadListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(toggleOPARules, toggleValidation),
    async effect(action, {dispatch, delay, signal, cancelActiveListeners}) {
      cancelActiveListeners();
      await delay(1);
      const loading = dispatch(loadValidation());
      signal.addEventListener('abort', () => loading.abort());
      await loading;
    },
  });
};

const validateListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(loadValidation.fulfilled),
    async effect(_action, {dispatch, getState, cancelActiveListeners, signal, delay}) {
      cancelActiveListeners();

      // if (getState().resources.previewLoading) {
      //   return;
      // }

      const validatorsLoading = getState().validation.status === 'loading';
      if (validatorsLoading) return;

      await delay(1);
      if (signal.aborted) return;
      const response = dispatch(validateResources());
      signal.addEventListener('abort', () => response.abort());
      await response;
    },
  });
};

// TODO: this is a temporary solution to run validation after the root folder is set
const runValidation: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(setRootFolder.fulfilled),
    async effect(_action, {dispatch}) {
      const loading = dispatch(loadValidation());
      await loading;
      dispatch(validateResources());
    },
  });
};

export const validationListeners = [loadListener, validateListener, runValidation];
