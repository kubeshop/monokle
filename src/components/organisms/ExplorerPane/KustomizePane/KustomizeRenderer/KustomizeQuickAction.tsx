import {useCallback, useMemo} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';

import styled from 'styled-components';

import {
  ExitKustomizationPreviewTooltip,
  KustomizationPreviewTooltip,
  ReloadKustomizationPreviewTooltip,
} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectResource} from '@redux/reducers/main';
import {useResource} from '@redux/selectors/resourceSelectors';
import {isKustomizationPreviewed, isResourceSelected} from '@redux/services/resource';
import {restartPreview, startPreview, stopPreview} from '@redux/thunks/preview';

import {QuickActionCompare, QuickActionPreview} from '@components/molecules';

import {useRefSelector} from '@utils/hooks';
import {isResourcePassingFilter} from '@utils/resources';

import {hotkeys} from '@shared/constants/hotkeys';
import {defineHotkey} from '@shared/utils/hotkey';

type IProps = {
  id: string;
  isSelected: boolean;
};

const KustomizeQuickAction: React.FC<IProps> = props => {
  const {id, isSelected} = props;

  const dispatch = useAppDispatch();
  const filters = useAppSelector(state => state.main.resourceFilter);
  const preview = useAppSelector(state => state.main.preview);
  const selectionRef = useRefSelector(state => state.main.selection);

  const thisKustomization = useResource({id, storage: 'local'});

  const isPassingFilter = useMemo(
    () => (thisKustomization ? isResourcePassingFilter(thisKustomization, filters) : false),
    [filters, thisKustomization]
  );
  const isThisPreviewed = useMemo(
    () => Boolean(thisKustomization && isKustomizationPreviewed(thisKustomization, preview)),
    [thisKustomization, preview]
  );

  const selectAndPreviewKustomization = useCallback(() => {
    if (thisKustomization && !isResourceSelected(thisKustomization, selectionRef.current)) {
      dispatch(selectResource({resourceIdentifier: {id: thisKustomization.id, storage: 'local'}}));
    }
    if (!isThisPreviewed) {
      dispatch(startPreview({type: 'kustomize', kustomizationId: id}));
    } else {
      dispatch(stopPreview());
    }
  }, [thisKustomization, selectionRef, isThisPreviewed, dispatch, id]);

  const reloadPreview = useCallback(() => {
    if (thisKustomization && isResourceSelected(thisKustomization, selectionRef.current)) {
      dispatch(selectResource({resourceIdentifier: {id: thisKustomization.id, storage: 'local'}}));
    }

    dispatch(restartPreview({type: 'kustomize', kustomizationId: id}));
  }, [thisKustomization, selectionRef, id, dispatch]);

  useHotkeys(defineHotkey(hotkeys.RELOAD_PREVIEW.key), () => {
    reloadPreview();
  });

  if (!isPassingFilter) {
    return null;
  }

  return (
    <Container>
      {preview?.type === 'kustomize' && !isThisPreviewed && (
        <QuickActionCompare
          from="quick-kustomize-compare"
          isItemSelected={isSelected}
          view={{
            leftSet: {
              type: 'kustomize',
              kustomizationId: preview.kustomizationId,
            },
            rightSet: {
              type: 'kustomize',
              kustomizationId: id,
            },
          }}
        />
      )}

      <QuickActionPreview
        isItemSelected={isSelected}
        isItemBeingPreviewed={isThisPreviewed}
        previewTooltip={KustomizationPreviewTooltip}
        reloadPreviewTooltip={ReloadKustomizationPreviewTooltip}
        exitPreviewTooltip={ExitKustomizationPreviewTooltip}
        selectAndPreview={selectAndPreviewKustomization}
        reloadPreview={reloadPreview}
      />
    </Container>
  );
};

export default KustomizeQuickAction;

// Styled Components

const Container = styled.div`
  display: flex;
  align-items: center;
`;
