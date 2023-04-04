import {memo, useCallback, useMemo, useState} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {collapseResourceKinds, expandResourceKinds} from '@redux/reducers/ui';
import {useSelectedResource} from '@redux/selectors/resourceSelectors';
import {isKustomizationPatch} from '@redux/services/kustomize';

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
  const highlights = useAppSelector(state => state.main.highlights);
  const resourceMetaMapByStorage = useAppSelector(state => state.main.resourceMetaMapByStorage);
  const selectedResource = useSelectedResource();

  const isHighlighted = useMemo(() => {
    return highlights.some(highlight => {
      if (highlight.type !== 'resource') {
        return false;
      }
      const resourceMeta =
        resourceMetaMapByStorage[highlight.resourceIdentifier.storage][highlight.resourceIdentifier.id];

      if (!resourceMeta) {
        return false;
      }

      return resourceMeta.kind === kind && (kind !== 'Kustomization' ? !isKustomizationPatch(resourceMeta) : true);
    });
  }, [highlights, kind, resourceMetaMapByStorage]);
  const isSelected = useMemo(() => {
    if (!selectedResource) {
      return false;
    }

    return (
      selectedResource.kind === kind && (kind !== 'Kustomization' ? !isKustomizationPatch(selectedResource) : true)
    );
  }, [kind, selectedResource]);

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

        <ResourceCounter kind={kind} isSelected={Boolean(isSelected)} onClick={toggleCollapse} />

        <S.BlankSpace onClick={toggleCollapse} />

        {isHovered && <KindSuffix kind={kind} isSelected={Boolean(isSelected)} />}
      </S.NameContainer>
    </S.SectionContainer>
  );
}

export default memo(KindRenderer);
