import {useCallback, useState} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {collapseKustomizeKinds, expandKustomizeKinds} from '@redux/reducers/ui';
import {getResourceMetaFromState} from '@redux/selectors/resourceGetters';

import {useSelectorWithRef} from '@utils/hooks';

import {KustomizeKindNode} from '@shared/models/kustomize';

import * as S from './KustomizeHeaderRenderer.styled';

type IProps = {
  node: KustomizeKindNode;
};

const KustomizeHeaderRenderer: React.FC<IProps> = props => {
  const {
    node: {count, label, kind},
  } = props;

  const dispatch = useAppDispatch();
  const [isCollapsed, isCollapsedRef] = useSelectorWithRef(state => state.ui.collapsedKustomizeKinds.includes(kind));
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

  const toggleCollapse = useCallback(() => {
    if (isCollapsedRef.current) {
      dispatch(expandKustomizeKinds([kind]));
    } else {
      dispatch(collapseKustomizeKinds([kind]));
    }
  }, [kind, isCollapsedRef, dispatch]);

  return (
    <S.SectionContainer
      isHovered={isHovered}
      isSelected={Boolean(isSelected && isCollapsed)}
      isHighlighted={Boolean(isHighlighted && isCollapsed)}
      isCollapsed={isCollapsed}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <S.NameContainer isHovered={isHovered} onClick={toggleCollapse}>
        <S.Name $isSelected={Boolean(isSelected && isCollapsed)} $isHighlighted={Boolean(isHighlighted && isCollapsed)}>
          {label}
        </S.Name>

        <S.KustomizationsCounter selected={Boolean(isSelected && isCollapsed)}>{count}</S.KustomizationsCounter>
      </S.NameContainer>
    </S.SectionContainer>
  );
};

export default KustomizeHeaderRenderer;
