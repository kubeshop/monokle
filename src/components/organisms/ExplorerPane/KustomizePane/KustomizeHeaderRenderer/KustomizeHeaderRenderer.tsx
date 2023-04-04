import {memo, useCallback, useMemo, useState} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {collapseKustomizeKinds, expandKustomizeKinds} from '@redux/reducers/ui';
import {useSelectedResource} from '@redux/selectors/resourceSelectors';
import {isKustomizationPatch} from '@redux/services/kustomize';

import {useSelectorWithRef} from '@utils/hooks';

import {KustomizeKindNode} from '@shared/models/kustomize';
import {isEqual} from '@shared/utils/isEqual';

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
  const selectedResource = useSelectedResource();
  const highlights = useAppSelector(state => state.main.highlights);
  const resourceMetaMapByStorage = useAppSelector(state => state.main.resourceMetaMapByStorage);

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

      return resourceMeta.kind === kind && (kind !== 'Kustomization' ? isKustomizationPatch(resourceMeta) : true);
    });
  }, [highlights, kind, resourceMetaMapByStorage]);

  const isSelected = useMemo(() => {
    if (!selectedResource) {
      return false;
    }

    return selectedResource.kind === kind && (kind !== 'Kustomization' ? isKustomizationPatch(selectedResource) : true);
  }, [kind, selectedResource]);

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

export default memo(KustomizeHeaderRenderer, isEqual);
