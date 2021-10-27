import React, {useCallback, useMemo} from 'react';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectHelmValuesFile} from '@redux/reducers/main';
import {restartPreview, startPreview, stopPreview} from '@redux/services/preview';
import {ExitHelmPreviewTooltip, HelmPreviewTooltip, ReloadHelmPreviewTooltip} from '@constants/tooltips';
import QuickActionPreview from '@components/molecules/QuickActionPreview';
import {ItemCustomComponentProps} from '@models/navigator';

const QuickAction = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;
  const dispatch = useAppDispatch();
  const selectedValuesFileId = useAppSelector(state => state.main.selectedValuesFileId);
  const previewValuesFileId = useAppSelector(state => state.main.previewValuesFileId);

  const isItemBeingPreviewed = useMemo(
    () => previewValuesFileId !== undefined && previewValuesFileId === itemInstance.id,
    [previewValuesFileId, itemInstance]
  );

  const selectAndPreviewHelmValuesFile = useCallback(() => {
    if (itemInstance.id !== selectedValuesFileId) {
      dispatch(selectHelmValuesFile({valuesFileId: itemInstance.id}));
    }
    if (itemInstance.id !== previewValuesFileId) {
      startPreview(itemInstance.id, 'helm', dispatch);
    } else {
      stopPreview(dispatch);
    }
  }, [itemInstance, selectedValuesFileId, previewValuesFileId, dispatch]);

  const reloadPreview = useCallback(() => {
    if (itemInstance.id !== selectedValuesFileId) {
      dispatch(selectHelmValuesFile({valuesFileId: itemInstance.id}));
    }

    restartPreview(itemInstance.id, 'helm', dispatch);
  }, [itemInstance, selectedValuesFileId, dispatch]);

  return (
    <QuickActionPreview
      isItemSelected={itemInstance.isSelected}
      isItemBeingPreviewed={isItemBeingPreviewed}
      previewTooltip={HelmPreviewTooltip}
      reloadPreviewTooltip={ReloadHelmPreviewTooltip}
      exitPreviewTooltip={ExitHelmPreviewTooltip}
      selectAndPreview={selectAndPreviewHelmValuesFile}
      reloadPreview={reloadPreview}
    />
  );
};

export default QuickAction;
