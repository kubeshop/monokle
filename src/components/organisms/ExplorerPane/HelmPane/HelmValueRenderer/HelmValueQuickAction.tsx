import {useCallback} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';

import styled from 'styled-components';
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
import {restartPreview, startPreview, stopPreview} from '@redux/thunks/preview';

import {QuickActionCompare, QuickActionPreview} from '@molecules';

import {hotkeys} from '@shared/constants/hotkeys';
import {ResourceSet} from '@shared/models/compare';
import {RootState} from '@shared/models/rootState';
import {isDefined} from '@shared/utils/filter';
import {defineHotkey} from '@shared/utils/hotkey';

type IProps = {
  id: string;
  isSelected: boolean;
};

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

const HelmValueQuickAction: React.FC<IProps> = props => {
  const {id, isSelected} = props;

  const dispatch = useAppDispatch();
  const {isFiltered, thisValuesFile, isAnyPreviewing, isThisPreviewing, isThisSelected, previewingResourceSet} =
    useAppSelector(state => selectQuickActionData(state, id));

  const selectAndPreviewHelmValuesFile = useCallback(() => {
    if (!isThisSelected) {
      dispatch(selectHelmValuesFile({valuesFileId: id}));
    }
    if (!isThisPreviewing) {
      dispatch(startPreview({type: 'helm', valuesFileId: id, chartId: thisValuesFile.helmChartId}));
    } else {
      dispatch(stopPreview());
    }
  }, [isThisSelected, isThisPreviewing, dispatch, id, thisValuesFile.helmChartId]);

  const reloadPreview = useCallback(() => {
    if (!isThisSelected) {
      dispatch(selectHelmValuesFile({valuesFileId: id}));
    }

    dispatch(restartPreview({type: 'helm', valuesFileId: id, chartId: thisValuesFile.helmChartId}));
  }, [isThisSelected, id, thisValuesFile.helmChartId, dispatch]);

  useHotkeys(defineHotkey(hotkeys.RELOAD_PREVIEW.key), () => {
    reloadPreview();
  });

  if (isFiltered) {
    return null;
  }

  return (
    <Container>
      {isAnyPreviewing && !isThisPreviewing && (
        <QuickActionCompare
          isItemSelected={isSelected}
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
        isItemSelected={isSelected}
        isItemBeingPreviewed={isThisPreviewing}
        previewTooltip={HelmPreviewTooltip}
        reloadPreviewTooltip={ReloadHelmPreviewTooltip}
        exitPreviewTooltip={ExitHelmPreviewTooltip}
        selectAndPreview={selectAndPreviewHelmValuesFile}
        reloadPreview={reloadPreview}
      />
    </Container>
  );
};

export default HelmValueQuickAction;

// Styled Components

const Container = styled.div`
  display: flex;
  align-items: center;
`;
