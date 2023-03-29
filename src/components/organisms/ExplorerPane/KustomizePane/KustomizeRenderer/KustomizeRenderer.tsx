import {useState} from 'react';

import {isInClusterModeSelector} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectResource} from '@redux/reducers/main';
import {useResourceMeta} from '@redux/selectors/resourceSelectors';
import {isResourceHighlighted, isResourceSelected} from '@redux/services/resource';

import {isResourcePassingFilter} from '@utils/resources';

import {ResourceIdentifier} from '@shared/models/k8sResource';

import KustomizeContextMenu from './KustomizeContextMenu';
import KustomizePrefix from './KustomizePrefix';
import KustomizeQuickAction from './KustomizeQuickAction';
import * as S from './KustomizeRenderer.styled';
import KustomizeSuffix from './KustomizeSuffix';

type IProps = {
  identifier: ResourceIdentifier;
};

const KustomizeRenderer: React.FC<IProps> = props => {
  const {identifier} = props;

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
        }
      }}
    >
      <S.PrefixContainer>
        <KustomizePrefix resourceMeta={resourceMeta} isSelected={isSelected} isDisabled={isDisabled} />
      </S.PrefixContainer>

      <S.ItemName isDisabled={isDisabled} isSelected={isSelected} isHighlighted={isHighlighted}>
        {resourceMeta.name}
      </S.ItemName>

      <S.SuffixContainer>
        <KustomizeSuffix resourceMeta={resourceMeta} isSelected={isSelected} isDisabled={isDisabled} />
      </S.SuffixContainer>

      {isHovered && (
        <div
          style={{display: 'flex', alignItems: 'center', marginLeft: 'auto'}}
          onClick={e => {
            e.stopPropagation();
          }}
        >
          <S.QuickActionContainer>
            <KustomizeQuickAction id={resourceMeta.id} isSelected={isSelected} />
          </S.QuickActionContainer>

          <S.ContextMenuContainer>
            <KustomizeContextMenu id={resourceMeta.id} isSelected={isSelected} />
          </S.ContextMenuContainer>
        </div>
      )}
    </S.ItemContainer>
  );
};

export default KustomizeRenderer;
