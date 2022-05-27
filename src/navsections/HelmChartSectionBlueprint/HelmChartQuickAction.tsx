import React, {useCallback} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';

import invariant from 'tiny-invariant';

import hotkeys from '@constants/hotkeys';
import {ExitHelmPreviewTooltip, HelmPreviewTooltip, ReloadHelmPreviewTooltip} from '@constants/tooltips';

import {ItemCustomComponentProps} from '@models/navigator';
import {RootState} from '@models/rootstate';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {ResourceSet} from '@redux/reducers/compare';
import {selectHelmValuesFile} from '@redux/reducers/main';
import {selectHelmConfig, selectHelmValues} from '@redux/selectors';
import {restartPreview, startPreview, stopPreview} from '@redux/services/preview';

import {QuickActionCompare} from '@components/molecules/QuickActionCompare';
import QuickActionPreview from '@components/molecules/QuickActionPreview';

import {defineHotkey} from '@utils/defineHotkey';
import {isDefined} from '@utils/filter';

const selectQuickActionData = (state: RootState, itemId: string) => {
  const thisValuesFile = selectHelmValues(state.main, itemId);
  invariant(thisValuesFile, 'values not found');

  const selectedValuesFile = selectHelmValues(state.main, state.main.selectedPreviewConfigurationId);
  const previewingHelmValues = selectHelmValues(state.main, state.main.previewValuesFileId);
  const previewingHelmConfig = selectHelmConfig(state, state.main.previewConfigurationId);

  const isAnyPreviewing = isDefined(previewingHelmValues) || isDefined(previewingHelmConfig);
  const isThisPreviewing = itemId === previewingHelmValues?.id;
  const isThisSelected = thisValuesFile?.id === selectedValuesFile?.id;

  const previewingResourceSet: ResourceSet | undefined = previewingHelmConfig
    ? {
        type: 'helm-custom',
        chartId: thisValuesFile.helmChartId,
        configId: previewingHelmConfig.id,
      }
    : previewingHelmValues
    ? {
        type: 'helm',
        chartId: previewingHelmValues.helmChartId,
        valuesId: previewingHelmValues.id,
      }
    : undefined;

  return {thisValuesFile, isAnyPreviewing, isThisPreviewing, isThisSelected, previewingResourceSet};
};

const QuickAction = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;
  const dispatch = useAppDispatch();
  const {thisValuesFile, isAnyPreviewing, isThisPreviewing, isThisSelected, previewingResourceSet} = useAppSelector(
    state => selectQuickActionData(state, itemInstance.id)
  );

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
          leftSet: previewingResourceSet,
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
