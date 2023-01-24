import {useCallback, useMemo} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';

import {
  ExitKustomizationPreviewTooltip,
  KustomizationPreviewTooltip,
  ReloadKustomizationPreviewTooltip,
} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectResource} from '@redux/reducers/main';
import {resourceMapSelector, resourceSelector} from '@redux/selectors';
import {restartPreview, startPreview, stopPreview} from '@redux/services/preview';
import {isKustomizationPreviewed, isResourceSelected} from '@redux/services/resource';

import {QuickActionCompare, QuickActionPreview} from '@components/molecules';

import {isResourcePassingFilter} from '@utils/resources';

import {hotkeys} from '@shared/constants/hotkeys';
import {ItemCustomComponentProps} from '@shared/models/navigator';
import {defineHotkey} from '@shared/utils/hotkey';

import * as S from './KustomizationQuickAction.styled';

const QuickAction = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;
  const dispatch = useAppDispatch();
  const filters = useAppSelector(state => state.main.resourceFilter);
  const localResourceMap = useAppSelector(state => resourceMapSelector(state, 'local'));

  const selection = useAppSelector(state => state.main.selection);
  const preview = useAppSelector(state => state.main.preview);

  const thisKustomization = useAppSelector(state => resourceSelector(state, {id: itemInstance.id, storage: 'local'}));

  const isThisPreviewed = useMemo(
    () => Boolean(thisKustomization && isKustomizationPreviewed(thisKustomization, preview)),
    [thisKustomization, preview]
  );

  const isPassingFilter = useMemo(
    () =>
      localResourceMap[itemInstance.id] ? isResourcePassingFilter(localResourceMap[itemInstance.id], filters) : false,
    [filters, itemInstance.id, localResourceMap]
  );

  const selectAndPreviewKustomization = useCallback(() => {
    if (thisKustomization && !isResourceSelected(thisKustomization, selection)) {
      dispatch(selectResource({resourceId: thisKustomization.id, resourceStorage: 'local'}));
    }
    if (!isThisPreviewed) {
      startPreview({type: 'kustomize', kustomizationId: itemInstance.id}, dispatch);
    } else {
      stopPreview(dispatch);
    }
  }, [itemInstance, isThisPreviewed, thisKustomization, selection, dispatch]);

  const reloadPreview = useCallback(() => {
    if (thisKustomization && isResourceSelected(thisKustomization, selection)) {
      dispatch(selectResource({resourceId: itemInstance.id, resourceStorage: 'local'}));
    }

    restartPreview({type: 'kustomize', kustomizationId: itemInstance.id}, dispatch);
  }, [itemInstance, selection, thisKustomization, dispatch]);

  useHotkeys(defineHotkey(hotkeys.RELOAD_PREVIEW.key), () => {
    reloadPreview();
  });

  if (!isPassingFilter) {
    return null;
  }

  return (
    <S.Container>
      {preview?.type === 'kustomize' && !isThisPreviewed && (
        <QuickActionCompare
          from="quick-kustomize-compare"
          isItemSelected={itemInstance.isSelected}
          view={{
            leftSet: {
              type: 'kustomize',
              kustomizationId: preview.kustomizationId,
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
        isItemBeingPreviewed={isThisPreviewed}
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
