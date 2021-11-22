import React, {useCallback, useMemo} from 'react';

import {
  ExitKustomizationPreviewTooltip,
  KustomizationPreviewTooltip,
  ReloadKustomizationPreviewTooltip,
} from '@constants/tooltips';

import {ItemCustomComponentProps} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectK8sResource} from '@redux/reducers/main';
import {restartPreview, startPreview, stopPreview} from '@redux/services/preview';

import QuickActionPreview from '@components/molecules/QuickActionPreview';

const QuickAction = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;
  const dispatch = useAppDispatch();
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const previewResourceId = useAppSelector(state => state.main.previewResourceId);

  const isItemBeingPreviewed = useMemo(
    () => previewResourceId !== undefined && previewResourceId === itemInstance.id,
    [previewResourceId, itemInstance]
  );

  const selectAndPreviewKustomization = useCallback(() => {
    if (itemInstance.id !== selectedResourceId) {
      dispatch(selectK8sResource({resourceId: itemInstance.id}));
    }
    if (itemInstance.id !== previewResourceId) {
      startPreview(itemInstance.id, 'kustomization', dispatch);
    } else {
      stopPreview(dispatch);
    }
  }, [itemInstance, selectedResourceId, previewResourceId, dispatch]);

  const reloadPreview = useCallback(() => {
    if (itemInstance.id !== selectedResourceId) {
      dispatch(selectK8sResource({resourceId: itemInstance.id}));
    }

    restartPreview(itemInstance.id, 'kustomization', dispatch);
  }, [itemInstance, selectedResourceId, dispatch]);

  return (
    <QuickActionPreview
      isItemSelected={itemInstance.isSelected}
      isItemBeingPreviewed={isItemBeingPreviewed}
      previewTooltip={KustomizationPreviewTooltip}
      reloadPreviewTooltip={ReloadKustomizationPreviewTooltip}
      exitPreviewTooltip={ExitKustomizationPreviewTooltip}
      selectAndPreview={selectAndPreviewKustomization}
      reloadPreview={reloadPreview}
    />
  );
};

export default QuickAction;
