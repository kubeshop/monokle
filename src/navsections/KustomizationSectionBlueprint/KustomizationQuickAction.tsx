import {useCallback, useMemo} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';

import {
  ExitKustomizationPreviewTooltip,
  KustomizationPreviewTooltip,
  ReloadKustomizationPreviewTooltip,
} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectK8sResource} from '@redux/reducers/main';
import {restartPreview, startPreview, stopPreview} from '@redux/services/preview';

import {QuickActionCompare, QuickActionPreview} from '@components/molecules';

import {defineHotkey} from '@utils/defineHotkey';
import {isDefined} from '@utils/filter';
import {isResourcePassingFilter} from '@utils/resources';

import {hotkeys} from '@monokle-desktop/shared/constants/hotkeys';
import {ItemCustomComponentProps} from '@monokle-desktop/shared/models';

import * as S from './KustomizationQuickAction.styled';

const QuickAction = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;
  const dispatch = useAppDispatch();
  const filters = useAppSelector(state => state.main.resourceFilter);
  const previewResourceId = useAppSelector(state => state.main.previewResourceId);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);

  const isAnyPreviewing = isDefined(previewResourceId);
  const isThisPreviewing = itemInstance.id === previewResourceId;

  const isItemBeingPreviewed = useMemo(
    () => previewResourceId !== undefined && previewResourceId === itemInstance.id,
    [previewResourceId, itemInstance]
  );

  const isPassingFilter = useMemo(
    () => (resourceMap[itemInstance.id] ? isResourcePassingFilter(resourceMap[itemInstance.id], filters) : false),
    [filters, itemInstance.id, resourceMap]
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

  useHotkeys(defineHotkey(hotkeys.RELOAD_PREVIEW.key), () => {
    reloadPreview();
  });

  if (!isPassingFilter) {
    return null;
  }

  return (
    <S.Container>
      {isAnyPreviewing && !isThisPreviewing && (
        <QuickActionCompare
          from="quick-kustomize-compare"
          isItemSelected={itemInstance.isSelected}
          view={{
            leftSet: {
              type: 'kustomize',
              kustomizationId: previewResourceId,
            },
            rightSet: {
              type: 'kustomize',
              kustomizationId: itemInstance.id,
            },
          }}
        />
      )}

      <QuickActionPreview
        isItemSelected={itemInstance.isSelected}
        isItemBeingPreviewed={isItemBeingPreviewed}
        previewTooltip={KustomizationPreviewTooltip}
        reloadPreviewTooltip={ReloadKustomizationPreviewTooltip}
        exitPreviewTooltip={ExitKustomizationPreviewTooltip}
        selectAndPreview={selectAndPreviewKustomization}
        reloadPreview={reloadPreview}
      />
    </S.Container>
  );
};

export default QuickAction;
