import {memo, useCallback, useState} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectResource} from '@redux/reducers/main';
import {useResourceMeta} from '@redux/selectors/resourceSelectors';
import {isResourceHighlighted, isResourceSelected} from '@redux/services/resource';

import ResourcePopover from '@components/molecules/ResourcePopover/ResourcePopover';

import {ResourceIdentifier} from '@shared/models/k8sResource';
import {trackEvent} from '@shared/utils';
import {isEqual} from '@shared/utils/isEqual';
import {isInClusterModeSelector} from '@shared/utils/selectors';

import ResourceContextMenu from './ResourceContextMenu';
import {ResourceInfoIcon} from './ResourceInfoIcon';
import ResourcePrefix from './ResourcePrefix';
import * as S from './ResourceRenderer.styled';
import ResourceSuffix from './ResourceSuffix';

export type ResourceRendererProps = {
  resourceIdentifier: ResourceIdentifier;
  disableContextMenu?: boolean;
};

function ResourceRenderer(props: ResourceRendererProps) {
  const {disableContextMenu = false, resourceIdentifier: propsResourceIdentifier} = props;
  const dispatch = useAppDispatch();
  const isInClusterMode = useAppSelector(isInClusterModeSelector);

  const transientResourceIdentifier: ResourceIdentifier = {id: propsResourceIdentifier.id, storage: 'transient'};
  const activeResourceMeta = useResourceMeta(propsResourceIdentifier);
  const transientResourceMeta = useResourceMeta(transientResourceIdentifier);
  const resourceMeta = activeResourceMeta || transientResourceMeta;
  const resourceIdentifier = activeResourceMeta
    ? propsResourceIdentifier
    : transientResourceMeta
    ? transientResourceIdentifier
    : undefined;

  const isSelected = useAppSelector(state =>
    Boolean(resourceIdentifier && isResourceSelected(resourceIdentifier, state.main.selection))
  );
  const isHighlighted = useAppSelector(state =>
    Boolean(resourceIdentifier && isResourceHighlighted(resourceIdentifier, state.main.highlights))
  );

  const [isHovered, setIsHovered] = useState<boolean>(false);

  const onClick = useCallback(() => {
    if (!resourceIdentifier) {
      return;
    }
    dispatch(selectResource({resourceIdentifier}));
    trackEvent('explore/select_resource', {kind: resourceMeta ? resourceMeta.kind : 'unknown'});
  }, [resourceIdentifier, dispatch, resourceMeta]);

  if (!resourceMeta) {
    return null;
  }

  return (
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
        <ResourcePopover resourceMeta={resourceMeta}>
          {resourceMeta.name} {resourceMeta.storage === 'transient' ? '*' : ''}
        </ResourcePopover>
      </S.ItemName>

      {isInClusterMode && (
        <S.InformationContainer>
          <ResourceInfoIcon resourceMeta={resourceMeta} isSelected={isSelected} />
        </S.InformationContainer>
      )}

      <S.SuffixContainer>
        <ResourceSuffix resourceMeta={resourceMeta} isSelected={isSelected} />
      </S.SuffixContainer>

      <S.BlankSpace onClick={onClick} />

      {isHovered && !disableContextMenu && (
        <S.ContextMenuContainer>
          <ResourceContextMenu resourceMeta={resourceMeta} isSelected={isSelected} />
        </S.ContextMenuContainer>
      )}
    </S.ItemContainer>
  );
}

export default memo(ResourceRenderer, isEqual);
