import React, {useCallback, useMemo} from 'react';
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
import QuickActionPreview from '@components/molecules/QuickActionPreview';

const QuickAction = (props: NavSectionItemCustomComponentProps<K8sResource>) => {
  const {item, isItemSelected, isItemHovered} = props;
  const dispatch = useAppDispatch();
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const previewResourceId = useAppSelector(state => state.main.previewResourceId);

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
  }, [item, selectedResourceId, previewResourceId]);

  const reloadPreview = useCallback(() => {
    if (item.id !== selectedResourceId) {
      dispatch(selectK8sResource({resourceId: item.id}));
    }

    startPreview(item.id, 'kustomization', dispatch);
  }, [item, selectedResourceId]);

  if (!isItemHovered) {
    return null;
  }

  return (
    <QuickActionPreview
      isItemSelected={isItemSelected}
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
