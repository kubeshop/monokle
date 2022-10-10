import {useCallback, useMemo} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';

import hotkeys from '@constants/hotkeys';
import {
  ExitKustomizationPreviewTooltip,
  KustomizationPreviewTooltip,
  ReloadKustomizationPreviewTooltip,
} from '@constants/tooltips';

import {ItemCustomComponentProps} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectK8sResource} from '@redux/reducers/main';
import {restartPreview, startPreview, stopPreview} from '@redux/services/preview';

import {QuickActionCompare, QuickActionPreview} from '@components/molecules';

import {defineHotkey} from '@utils/defineHotkey';
import {isDefined} from '@utils/filter';
import {isResourcePassingFilter} from '@utils/resources';

import * as S from './KustomizationQuickAction.styled';

const QuickAction = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;
  const dispatch = useAppDispatch();
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const previewResourceId = useAppSelector(state => state.main.previewResourceId);
  const isAnyPreviewing = isDefined(previewResourceId);
  const isThisPreviewing = itemInstance.id === previewResourceId;
  const filters = useAppSelector(state => state.main.resourceFilter);
  const resourceMap = useAppSelector(state => state.main.resourceMap);

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

  useHotkeys(defineHotkey(hotkeys.RELOAD_PREVIEW.key), () => {
    reloadPreview();
  });

  if (!isResourcePassingFilter(resourceMap[itemInstance.id], filters, false)) {
    return <span />;
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
