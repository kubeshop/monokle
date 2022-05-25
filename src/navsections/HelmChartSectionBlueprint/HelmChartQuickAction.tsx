import React, {useCallback} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';

import hotkeys from '@constants/hotkeys';
import {ExitHelmPreviewTooltip, HelmPreviewTooltip, ReloadHelmPreviewTooltip} from '@constants/tooltips';

import {ItemCustomComponentProps} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectHelmValuesFile} from '@redux/reducers/main';
import {selectValuesFile} from '@redux/selectors';
import {restartPreview, startPreview, stopPreview} from '@redux/services/preview';

import {QuickActionCompare} from '@components/molecules/QuickActionCompare';
import QuickActionPreview from '@components/molecules/QuickActionPreview';

import {defineHotkey} from '@utils/defineHotkey';
import {isDefined} from '@utils/filter';

const QuickAction = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;
  const dispatch = useAppDispatch();
  const thisValuesFile = useAppSelector(state => {
    return selectValuesFile(state.main, itemInstance.id);
  });
  const selectedValuesFile = useAppSelector(state => {
    return selectValuesFile(state.main, state.main.selectedPreviewConfigurationId);
  });
  const previewValuesFile = useAppSelector(state => {
    return selectValuesFile(state.main, state.main.previewValuesFileId);
  });
  const isAnyPreviewing = isDefined(previewValuesFile);
  const isThisPreviewing = itemInstance.id === previewValuesFile?.id;
  const isThisSelected = itemInstance.id === selectedValuesFile?.id;

  const selectAndPreviewHelmValuesFile = useCallback(() => {
    if (!isThisSelected) {
      dispatch(selectHelmValuesFile({valuesFileId: itemInstance.id}));
    }
    if (!isThisPreviewing) {
      startPreview(itemInstance.id, 'helm', dispatch);
    } else {
      stopPreview(dispatch);
    }
  }, [isThisSelected, isThisPreviewing, dispatch, itemInstance.id]);

  const reloadPreview = useCallback(() => {
    if (!isThisSelected) {
      dispatch(selectHelmValuesFile({valuesFileId: itemInstance.id}));
    }

    restartPreview(itemInstance.id, 'helm', dispatch);
  }, [isThisSelected, itemInstance.id, dispatch]);

  useHotkeys(defineHotkey(hotkeys.RELOAD_PREVIEW.key), () => {
    reloadPreview();
  });

  if (isAnyPreviewing && !isThisPreviewing) {
    return (
      <QuickActionCompare
        isItemSelected={itemInstance.isSelected}
        view={{
          leftSet: {
            type: 'helm',
            chartId: previewValuesFile.helmChartId,
            valuesId: previewValuesFile.id,
          },
          rightSet: {
            type: 'helm',
            chartId: thisValuesFile?.helmChartId,
            valuesId: thisValuesFile?.id,
          },
        }}
      />
    );
  }

  return (
    <QuickActionPreview
      isItemSelected={itemInstance.isSelected}
      isItemBeingPreviewed={isThisPreviewing}
      previewTooltip={HelmPreviewTooltip}
      reloadPreviewTooltip={ReloadHelmPreviewTooltip}
      exitPreviewTooltip={ExitHelmPreviewTooltip}
      selectAndPreview={selectAndPreviewHelmValuesFile}
      reloadPreview={reloadPreview}
    />
  );
};

export default QuickAction;
