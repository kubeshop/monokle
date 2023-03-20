import {useCallback, useState} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {collapseResourceKinds, expandResourceKinds} from '@redux/reducers/ui';
import {getResourceMetaFromState} from '@redux/selectors/resourceGetters';

import {useSelectorWithRef} from '@utils/hooks';

import * as S from './KindRenderer.styled';
import KindSuffix from './KindSuffix';
import ResourceCounter from './ResourceCounter';

interface KindRendererProps {
  kind: string;
}

function KindRenderer(props: KindRendererProps) {
  const {kind} = props;
  const dispatch = useAppDispatch();
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const isSelected = useAppSelector(
    state =>
      state.main.selection?.type === 'resource' &&
      getResourceMetaFromState(state, state.main.selection.resourceIdentifier)?.kind === kind
  );
  const isHighlighted = useAppSelector(state =>
    state.main.highlights.some(
      highlight =>
        highlight.type === 'resource' && getResourceMetaFromState(state, highlight.resourceIdentifier)?.kind === kind
    )
  );
  const [isCollapsed, isCollapsedRef] = useSelectorWithRef(state =>
    state.ui.navigator.collapsedResourceKinds.includes(kind)
  );

  const toggleCollapse = useCallback(() => {
    if (isCollapsedRef.current) {
      dispatch(expandResourceKinds([kind]));
    } else {
      dispatch(collapseResourceKinds([kind]));
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
      <S.NameContainer isHovered={isHovered}>
        <S.Name
          $isSelected={isSelected && isCollapsed}
          $isHighlighted={isHighlighted && isCollapsed}
          onClick={toggleCollapse}
        >
          {kind}
        </S.Name>

        <ResourceCounter kind={kind} isSelected={isSelected} onClick={toggleCollapse} />

        <S.BlankSpace onClick={toggleCollapse} />

        {isHovered && <KindSuffix kind={kind} isSelected={isSelected} />}
      </S.NameContainer>
    </S.SectionContainer>
  );
}

export default KindRenderer;
