import {isAnyOf} from '@reduxjs/toolkit';

import {AppListenerFn} from '@redux/listeners/base';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {setConfigK8sSchemaVersion, toggleOPARules, toggleValidation} from './validation.slice';
import {loadValidation, validateResources} from './validation.thunks';

const loadListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(setRootFolder.fulfilled, setConfigK8sSchemaVersion, toggleOPARules, toggleValidation),
    async effect(_, {dispatch, delay, signal, cancelActiveListeners}) {
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

export const validationListeners = [loadListener, validateListener];
