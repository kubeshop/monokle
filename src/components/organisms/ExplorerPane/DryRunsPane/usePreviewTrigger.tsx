import {useCallback, useEffect, useState} from 'react';

import {AnyAction, isAnyOf, removeListener} from '@reduxjs/toolkit';

import {isEqual} from 'lodash';

import {addAppListener, useAppDispatch, useAppSelector} from '@redux/hooks';
import {startPreview} from '@redux/thunks/preview';

import {AnyPreview} from '@shared/models/preview';

export const usePreviewTrigger = (preview: AnyPreview) => {
  const dispatch = useAppDispatch();
  const [isOptimisticLoading, setIsOptimisticLoading] = useState(false);
  const isPreviewLoading = useAppSelector(state => state.main.previewOptions.isLoading);

  // the reload of a preview can be triggered from multiple places, not only from where this hook is used
  // so we have to listen to startPreview in case our state is not up to date
  useEffect(() => {
    const listener = {
      matcher: isAnyOf(startPreview.pending, startPreview.rejected, startPreview.fulfilled),
      effect: (action: AnyAction) => {
        if (startPreview.pending.match(action) && isEqual(action.meta.arg, preview)) {
          setIsOptimisticLoading(true);
        }

        if (isAnyOf(startPreview.fulfilled, startPreview.rejected)(action)) {
          setIsOptimisticLoading(false);
        }
      },
    };
    dispatch(addAppListener(listener));
    return () => {
      dispatch(removeListener(listener));
    };
  }, [dispatch, preview]);

  useEffect(() => {
    if (!isPreviewLoading) {
      setIsOptimisticLoading(false);
    }
  }, [isPreviewLoading]);

  const triggerPreview = useCallback(() => {
    if (isPreviewLoading) {
      return;
    }
    setIsOptimisticLoading(true);
    dispatch(startPreview(preview));
  }, [preview, dispatch, isPreviewLoading]);

  return {
    triggerPreview,
    isOptimisticLoading,
  };
};
