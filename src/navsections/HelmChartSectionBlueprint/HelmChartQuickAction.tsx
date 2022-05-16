import React, {useCallback, useMemo} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';

import hotkeys from '@constants/hotkeys';
import {ExitHelmPreviewTooltip, HelmPreviewTooltip, ReloadHelmPreviewTooltip} from '@constants/tooltips';

import {ItemCustomComponentProps} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectHelmValuesFile} from '@redux/reducers/main';
import {restartPreview, startPreview, stopPreview} from '@redux/services/preview';

import QuickActionPreview from '@components/molecules/QuickActionPreview';

import {defineHotkey} from '@utils/defineHotkey';

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

  useHotkeys(defineHotkey(hotkeys.RELOAD_PREVIEW.key), () => {
    reloadPreview();
  });

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
