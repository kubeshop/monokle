import React from 'react';
import {Tooltip} from 'antd';
import {TOOLTIP_DELAY} from '@constants/constants';
import {useAppSelector} from '@redux/hooks';
import * as S from './styled';

function QuickActionPreview(props: {
  isItemSelected: boolean;
  isItemBeingPreviewed: boolean;
  previewTooltip: string;
  reloadPreviewTooltip: string;
  exitPreviewTooltip: string;
  selectAndPreviewOrExit: () => void;
  reloadPreview: () => void;
}) {
  const {
    isItemSelected,
    isItemBeingPreviewed,
    previewTooltip,
    reloadPreviewTooltip,
    exitPreviewTooltip,
    selectAndPreviewOrExit,
    reloadPreview,
  } = props;

  const isPreviewLoading = useAppSelector(state => state.main.previewLoader.isLoading);

  if (isPreviewLoading) {
    return <S.Spin indicator={S.PreviewLoadingIcon} />;
  }

  return (
    <S.Container>
      <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={isItemBeingPreviewed ? exitPreviewTooltip : previewTooltip}>
        <S.PreviewSpan isItemSelected={isItemSelected} onClick={selectAndPreviewOrExit}>
          {isItemBeingPreviewed ? 'Exit' : 'Preview'}
        </S.PreviewSpan>
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
