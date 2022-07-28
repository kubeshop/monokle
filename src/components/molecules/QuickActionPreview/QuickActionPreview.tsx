import {Tooltip} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {stopPreview} from '@redux/services/preview';

import * as S from './QuickActionPreview.styled';

interface IProps {
  exitPreviewTooltip: string;
  isItemBeingPreviewed: boolean;
  isItemSelected: boolean;
  previewTooltip: string;
  reloadPreviewTooltip: string;
  reloadPreview: () => void;
  selectAndPreview: () => void;
}

const QuickActionPreview: React.FC<IProps> = props => {
  const {isItemSelected, isItemBeingPreviewed, previewTooltip, reloadPreviewTooltip, exitPreviewTooltip} = props;
  const {reloadPreview, selectAndPreview} = props;

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
};

export default QuickActionPreview;
