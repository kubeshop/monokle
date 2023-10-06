import {useCallback, useEffect, useState} from 'react';

import {Tooltip} from 'antd';

import {AnyAction, isAnyOf, removeListener} from '@reduxjs/toolkit';

import {isEqual} from 'lodash';

import {TOOLTIP_DELAY} from '@constants/constants';

import {addAppListener, useAppDispatch, useAppSelector} from '@redux/hooks';
import {restartPreview, startPreview, stopPreview} from '@redux/thunks/preview';

import {AnyPreview} from '@shared/models/preview';

import * as S from './styled';

export const usePreviewTrigger = (preview: AnyPreview) => {
  const dispatch = useAppDispatch();
  const [isOptimisticLoading, setIsOptimisticLoading] = useState(false);
  const isPreviewLoading = useAppSelector(state => state.main.previewOptions.isLoading);
  const isPreviewed = useAppSelector(state => isEqual(state.main.preview, preview));

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

  const renderPreviewControls = useCallback(() => {
    if (!isPreviewed) {
      return null;
    }
    return (
      <>
        <Tooltip title="Reload Dry-run" mouseEnterDelay={TOOLTIP_DELAY}>
          <S.ReloadIcon spin={isOptimisticLoading} onClick={() => preview && dispatch(restartPreview(preview))} />
        </Tooltip>
        <Tooltip title="Exit Dry-run" mouseEnterDelay={TOOLTIP_DELAY}>
          <S.CloseIcon onClick={() => dispatch(stopPreview())} />
        </Tooltip>
      </>
    );
  }, [dispatch, isPreviewed, preview, isOptimisticLoading]);

  return {
    triggerPreview,
    isOptimisticLoading: isPreviewed ? false : isOptimisticLoading,
    renderPreviewControls,
  };
};
