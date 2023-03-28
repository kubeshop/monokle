import {useState} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {toggleKustomizationsCollapse} from '@redux/reducers/ui';
import {getResourceMetaFromState} from '@redux/selectors/resourceGetters';

import {KustomizeKindNode} from '@shared/models/kustomize';

import * as S from './KustomizeHeaderRenderer.styled';

type IProps = {
  node: KustomizeKindNode;
};

const KustomizeHeaderRenderer: React.FC<IProps> = props => {
  const {
    node: {count, name},
  } = props;

  const dispatch = useAppDispatch();
  const isCollapsed = useAppSelector(state => state.ui.isKustomizationsCollapsed);
  const isHighlighted = useAppSelector(state =>
    state.main.highlights.some(
      highlight =>
        highlight.type === 'resource' &&
        getResourceMetaFromState(state, highlight.resourceIdentifier)?.kind === 'Kustomization'
    )
  );
  const isSelected = useAppSelector(
    state =>
      state.main.selection?.type === 'resource' &&
      getResourceMetaFromState(state, state.main.selection.resourceIdentifier)?.kind === 'Kustomization'
  );

  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <S.SectionContainer
      isHovered={isHovered}
      isSelected={Boolean(isSelected && isCollapsed)}
      isHighlighted={Boolean(isHighlighted && isCollapsed)}
      isCollapsed={isCollapsed}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <S.NameContainer isHovered={isHovered} onClick={() => dispatch(toggleKustomizationsCollapse())}>
        <S.Name $isSelected={Boolean(isSelected && isCollapsed)} $isHighlighted={Boolean(isHighlighted && isCollapsed)}>
          {name}
        </S.Name>

        <S.KustomizationsCounter selected={Boolean(isSelected && isCollapsed)}>{count}</S.KustomizationsCounter>
      </S.NameContainer>
    </S.SectionContainer>
  );
};

export default KustomizeHeaderRenderer;
