import {isAnyOf} from '@reduxjs/toolkit';

import {AppListenerFn} from '@redux/listeners/base';
import {multiplePathsChanged} from '@redux/thunks/multiplePathsChanged';
import {stopPreview} from '@redux/thunks/preview';
import {updateFileEntry} from '@redux/thunks/updateFileEntry';

export const shouldStopKustomizeDryRunListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(updateFileEntry.fulfilled, multiplePathsChanged.fulfilled),
    effect: (action, listenerApi) => {
      listenerApi.cancelActiveListeners();

      const mainState = listenerApi.getState().main;

      // check if the update resulted in the removal of the currently dry-run kustomize overlay
      if (
        mainState.preview?.type === 'kustomize' &&
        !mainState.resourceMetaMapByStorage.local[mainState.preview.kustomizationId]
      ) {
        listenerApi.dispatch(stopPreview());
      }
    },
  });
};
