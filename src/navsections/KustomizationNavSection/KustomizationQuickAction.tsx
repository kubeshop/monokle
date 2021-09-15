import React, {useCallback, useMemo} from 'react';
import {Tooltip} from 'antd';
import {NavSectionItemCustomComponentProps} from '@models/navsection';
import {K8sResource} from '@models/k8sresource';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectK8sResource} from '@redux/reducers/main';
import {startPreview, stopPreview} from '@redux/services/preview';
import {
  ExitKustomizationPreviewTooltip,
  KustomizationPreviewTooltip,
  ReloadKustomizationPreviewTooltip,
} from '@constants/tooltips';
import {TOOLTIP_DELAY} from '@constants/constants';
import * as S from './KustomizationQuickAction.styled';

const QuickAction = (props: NavSectionItemCustomComponentProps<K8sResource>) => {
  const {item, isItemHovered} = props;
  const dispatch = useAppDispatch();
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const previewResourceId = useAppSelector(state => state.main.previewResourceId);

  const isItemSelected = useMemo(() => item.isSelected || previewResourceId === item.id, [previewResourceId, item]);

  const isItemBeingPreviewed = useMemo(
    () => previewResourceId !== undefined && previewResourceId === item.id,
    [previewResourceId, item]
  );

  const selectAndPreviewKustomization = useCallback(() => {
    if (item.id !== selectedResourceId) {
      dispatch(selectK8sResource({resourceId: item.id}));
    }
    if (item.id !== previewResourceId) {
      startPreview(item.id, 'kustomization', dispatch);
    } else {
      stopPreview(dispatch);
    }
  }, [item]);

  const reloadPreview = useCallback(() => {
    if (item.id !== selectedResourceId) {
      dispatch(selectK8sResource({resourceId: item.id}));
    }

    startPreview(item.id, 'kustomization', dispatch);
  }, [item]);

  if (!isItemHovered) {
    return null;
  }
  return (
    <>
      <Tooltip
        mouseEnterDelay={TOOLTIP_DELAY}
        title={isItemBeingPreviewed ? ExitKustomizationPreviewTooltip : KustomizationPreviewTooltip}
      >
        <S.PreviewSpan isSelected={isItemSelected} onClick={selectAndPreviewKustomization}>
          {isItemBeingPreviewed ? 'Exit' : 'Preview'}
        </S.PreviewSpan>
      </Tooltip>

      {isItemBeingPreviewed && (
        <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={ReloadKustomizationPreviewTooltip}>
          <S.ReloadSpan isSelected={isItemSelected} onClick={reloadPreview}>
            Reload
          </S.ReloadSpan>
        </Tooltip>
      )}
    </>
  );
};

export default QuickAction;
