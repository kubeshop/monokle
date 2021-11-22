import React from 'react';

import {Tooltip} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {stopPreview} from '@redux/services/preview';

import * as S from './styled';

function QuickActionPreview(props: {
  isItemSelected: boolean;
  isItemBeingPreviewed: boolean;
  previewTooltip: string;
  reloadPreviewTooltip: string;
  exitPreviewTooltip: string;
  selectAndPreview: () => void;
  reloadPreview: () => void;
}) {
  const {
    isItemSelected,
    isItemBeingPreviewed,
    previewTooltip,
    reloadPreviewTooltip,
    exitPreviewTooltip,
    selectAndPreview,
    reloadPreview,
  } = props;

  const dispatch = useAppDispatch();
  const isPreviewLoading = useAppSelector(state => state.main.previewLoader.isLoading);

  const exitPreview = () => {
    stopPreview(dispatch);
  };

  if (isPreviewLoading) {
    return <S.Spin indicator={S.PreviewLoadingIcon} />;
  }

  return (
    <S.Container>
      <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={isItemBeingPreviewed ? exitPreviewTooltip : previewTooltip}>
        {isItemBeingPreviewed ? (
          <S.PreviewSpan isItemSelected={isItemSelected} onClick={exitPreview}>
            Exit
          </S.PreviewSpan>
        ) : (
          <S.PreviewSpan isItemSelected={isItemSelected} onClick={selectAndPreview}>
            Preview
          </S.PreviewSpan>
        )}
      </Tooltip>

      {isItemBeingPreviewed && (
        <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={reloadPreviewTooltip}>
          <S.ReloadSpan isItemSelected={isItemSelected} onClick={reloadPreview}>
            Reload
          </S.ReloadSpan>
        </Tooltip>
      )}
    </S.Container>
  );
}

export default QuickActionPreview;
