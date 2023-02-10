import React, {useCallback} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';

import invariant from 'tiny-invariant';

import {ExitHelmPreviewTooltip, HelmPreviewTooltip, ReloadHelmPreviewTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectHelmValuesFile} from '@redux/reducers/main';
import {
  previewedHelmConfigSelector,
  previewedValuesFileSelector,
  selectHelmValues,
  selectedHelmValuesSelector,
} from '@redux/selectors';
import {restartPreview, startPreview, stopPreview} from '@redux/services/preview';

import {QuickActionCompare, QuickActionPreview} from '@components/molecules';

import {hotkeys} from '@shared/constants/hotkeys';
import {ResourceSet} from '@shared/models/compare';
import {ItemCustomComponentProps} from '@shared/models/navigator';
import {RootState} from '@shared/models/rootState';
import {isDefined} from '@shared/utils/filter';
import {defineHotkey} from '@shared/utils/hotkey';

import * as S from './HelmChartQuickAction.styled';

const selectQuickActionData = (state: RootState, itemId: string) => {
  const previewedHelmValuesFile = previewedValuesFileSelector(state);
  const previewedHelmConfig = previewedHelmConfigSelector(state);
  const thisValuesFile = selectHelmValues(state.main, itemId);
  invariant(thisValuesFile, 'values not found');

  const selectedHelmValues = selectedHelmValuesSelector(state);

  const isAnyPreviewing = isDefined(previewedHelmValuesFile) || isDefined(previewedHelmConfig);
  const isThisPreviewing = itemId === previewedHelmValuesFile?.id;
  const isThisSelected = thisValuesFile?.id === selectedHelmValues?.id;
  const isFiltered = !thisValuesFile.filePath.startsWith(state.main.resourceFilter.fileOrFolderContainedIn || '');

  const previewingResourceSet: ResourceSet | undefined = previewedHelmConfig
    ? {
        type: 'helm-custom',
        chartId: thisValuesFile.helmChartId,
        configId: previewedHelmConfig.id,
      }
    : previewedHelmValuesFile
    ? {
        type: 'helm',
        chartId: previewedHelmValuesFile.helmChartId,
        valuesId: previewedHelmValuesFile.id,
      }
    : undefined;

  return {isFiltered, thisValuesFile, isAnyPreviewing, isThisPreviewing, isThisSelected, previewingResourceSet};
};

const QuickAction = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;
  const dispatch = useAppDispatch();
  const {isFiltered, thisValuesFile, isAnyPreviewing, isThisPreviewing, isThisSelected, previewingResourceSet} =
    useAppSelector(state => selectQuickActionData(state, itemInstance.id));

  const helmValuesFile = useAppSelector(state => state.main.helmValuesMap[itemInstance.id]);

  const selectAndPreviewHelmValuesFile = useCallback(() => {
    if (!isThisSelected) {
      dispatch(selectHelmValuesFile({valuesFileId: itemInstance.id}));
    }
    if (!isThisPreviewing) {
      startPreview({type: 'helm', valuesFileId: itemInstance.id, chartId: helmValuesFile.helmChartId}, dispatch);
    } else {
      stopPreview(dispatch);
    }
  }, [isThisSelected, isThisPreviewing, itemInstance.id, helmValuesFile.helmChartId, dispatch]);

  const reloadPreview = useCallback(() => {
    if (!isThisSelected) {
      dispatch(selectHelmValuesFile({valuesFileId: itemInstance.id}));
    }

    restartPreview({type: 'helm', valuesFileId: itemInstance.id, chartId: helmValuesFile.helmChartId}, dispatch);
  }, [isThisSelected, itemInstance.id, helmValuesFile.helmChartId, dispatch]);

  useHotkeys(defineHotkey(hotkeys.RELOAD_PREVIEW.key), () => {
    reloadPreview();
  });

  if (isFiltered) {
    return null;
  }

  return (
    <S.QuickActionsContainer>
      {isAnyPreviewing && !isThisPreviewing && (
        <QuickActionCompare
          isItemSelected={itemInstance.isSelected}
          from="quick-helm-compare"
          view={{
            leftSet: previewingResourceSet,
            rightSet: {
              type: 'helm',
              chartId: thisValuesFile?.helmChartId,
              valuesId: thisValuesFile?.id,
            },
          }}
        />
      )}

      <QuickActionPreview
        isItemSelected={itemInstance.isSelected}
        isItemBeingPreviewed={isThisPreviewing}
        previewTooltip={HelmPreviewTooltip}
        reloadPreviewTooltip={ReloadHelmPreviewTooltip}
        exitPreviewTooltip={ExitHelmPreviewTooltip}
        selectAndPreview={selectAndPreviewHelmValuesFile}
        reloadPreview={reloadPreview}
      />
    </S.QuickActionsContainer>
  );
};

export default QuickAction;
