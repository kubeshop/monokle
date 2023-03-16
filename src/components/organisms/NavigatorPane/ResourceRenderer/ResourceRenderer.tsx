import {memo, useCallback, useState} from 'react';

import {isEqual} from 'lodash';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectResource} from '@redux/reducers/main';
import {useResourceMeta} from '@redux/selectors/resourceSelectors';
import {isResourceHighlighted, isResourceSelected} from '@redux/services/resource';

import {ResourceIdentifier} from '@shared/models/k8sResource';

import ResourceContextMenu from './ResourceContextMenu';
import {ResourceInfoIcon} from './ResourceInfoIcon';
import ResourcePrefix from './ResourcePrefix';
import * as S from './ResourceRenderer.styled';
import ResourceSuffix from './ResourceSuffix';

export type ResourceRendererProps = {
  resourceIdentifier: ResourceIdentifier;
};

function ResourceRenderer(props: ResourceRendererProps) {
  const {resourceIdentifier} = props;
  const dispatch = useAppDispatch();

  const resourceMeta = useResourceMeta(resourceIdentifier);

  const isSelected = useAppSelector(state => isResourceSelected(resourceIdentifier, state.main.selection));
  const isHighlighted = useAppSelector(state => isResourceHighlighted(resourceIdentifier, state.main.highlights));

  const [isHovered, setIsHovered] = useState<boolean>(false);

  const onClick = useCallback(() => {
    dispatch(selectResource({resourceIdentifier}));
  }, [resourceIdentifier, dispatch]);

  if (!resourceMeta) {
    return null;
  }

  return (
    <span>
      <S.ItemContainer
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        isSelected={isSelected}
        isHighlighted={isHighlighted}
        isHovered={isHovered}
      >
        <S.PrefixContainer>
          <ResourcePrefix resourceMeta={resourceMeta} isSelected={isSelected} />
        </S.PrefixContainer>

        <S.ItemName
          isSelected={isSelected}
          isDirty={resourceMeta.storage === 'transient'}
          isHighlighted={isHighlighted}
          isDisabled={false}
          onClick={onClick}
        >
          {resourceMeta.name} {resourceMeta.storage === 'transient' ? '*' : ''}
        </S.ItemName>

        <S.InformationContainer>
          <ResourceInfoIcon resourceMeta={resourceMeta} isSelected={isSelected} />
        </S.InformationContainer>

        <S.SuffixContainer>
          <ResourceSuffix resourceMeta={resourceMeta} isSelected={isSelected} />
        </S.SuffixContainer>

        <S.BlankSpace onClick={onClick} />

        {isHovered && (
          <S.ContextMenuContainer>
            <ResourceContextMenu resourceMeta={resourceMeta} isSelected={isSelected} />
          </S.ContextMenuContainer>
        )}
      </S.ItemContainer>
    </span>
  );
}

export default memo(ResourceRenderer, isEqual);