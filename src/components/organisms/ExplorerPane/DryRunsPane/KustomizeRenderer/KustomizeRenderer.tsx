import {memo, useState} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectResource} from '@redux/reducers/main';
import {useResourceMeta} from '@redux/selectors/resourceSelectors';
import {isResourceHighlighted, isResourceSelected} from '@redux/services/resource';

import {renderKustomizeName} from '@utils/kustomize';
import {isResourcePassingFilter} from '@utils/resources';

import {trackEvent} from '@shared/utils';
import {isEqual} from '@shared/utils/isEqual';
import {isInClusterModeSelector} from '@shared/utils/selectors';

import KustomizeContextMenu from './KustomizeContextMenu';
import KustomizePrefix from './KustomizePrefix';
import KustomizeQuickAction from './KustomizeQuickAction';
import * as S from './KustomizeRenderer.styled';
import KustomizeSuffix from './KustomizeSuffix';

type IProps = {
  kustomizationId: string;
};

const KustomizeRenderer: React.FC<IProps> = props => {
  const {kustomizationId} = props;
  const identifier = {id: kustomizationId, storage: 'local' as const};

  const dispatch = useAppDispatch();
  const resourceMeta = useResourceMeta(identifier);
  const isDisabled = useAppSelector(state =>
    Boolean(
      (state.main.preview?.type === 'kustomize' && state.main.preview?.kustomizationId !== identifier.id) ||
        isInClusterModeSelector(state) ||
        (resourceMeta && !isResourcePassingFilter(resourceMeta, state.main.resourceFilter))
    )
  );
  const isHighlighted = useAppSelector(state =>
    Boolean(identifier && isResourceHighlighted(identifier, state.main.highlights))
  );
  const isSelected = useAppSelector(state =>
    Boolean(identifier && isResourceSelected(identifier, state.main.selection))
  );

  const [isHovered, setIsHovered] = useState<boolean>(false);

  if (!resourceMeta) {
    return null;
  }

  return (
    <S.ItemContainer
      isDisabled={isDisabled}
      isHovered={isHovered}
      isSelected={isSelected}
      isHighlighted={isHighlighted}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (!isDisabled) {
          dispatch(selectResource({resourceIdentifier: identifier}));
          trackEvent('explore/select_overlay');
        }
      }}
    >
      <S.PrefixContainer>
        <KustomizePrefix resourceMeta={resourceMeta} isSelected={isSelected} isDisabled={isDisabled} />
      </S.PrefixContainer>

      <S.ItemName isDisabled={isDisabled} isSelected={isSelected} isHighlighted={isHighlighted}>
        {renderKustomizeName(resourceMeta, resourceMeta.name)}
      </S.ItemName>

      <S.SuffixContainer>
        <KustomizeSuffix resourceMeta={resourceMeta} isSelected={isSelected} isDisabled={isDisabled} />
      </S.SuffixContainer>

      <div
        style={{display: 'flex', alignItems: 'center', marginLeft: 'auto'}}
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <S.QuickActionContainer>
          <KustomizeQuickAction id={resourceMeta.id} isSelected={isSelected} />
        </S.QuickActionContainer>

        {isHovered ? (
          <S.ContextMenuContainer>
            <KustomizeContextMenu id={resourceMeta.id} isSelected={isSelected} />
          </S.ContextMenuContainer>
        ) : (
          <S.ContextMenuPlaceholder />
        )}
      </div>
    </S.ItemContainer>
  );
};

export default memo(KustomizeRenderer, isEqual);
