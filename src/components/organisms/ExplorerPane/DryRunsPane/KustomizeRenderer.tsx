import {memo, useMemo, useState} from 'react';

import {basename, dirname} from 'path';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectResource} from '@redux/reducers/main';
import {useResourceMeta} from '@redux/selectors/resourceSelectors';
import {isResourceHighlighted, isResourceSelected} from '@redux/services/resource';

import {ResourceRefsIconPopover} from '@components/molecules';

import {isResourcePassingFilter} from '@utils/resources';

import {trackEvent} from '@shared/utils';
import {isEqual} from '@shared/utils/isEqual';
import {isInClusterModeSelector} from '@shared/utils/selectors';

import * as S from './styled';

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

  const kustomizationName = useMemo(() => {
    if (!resourceMeta) {
      return 'unnamed kustomization';
    }
    const folderName = basename(dirname(resourceMeta.origin.filePath));
    return folderName.trim().length > 0 ? folderName : basename(resourceMeta.name);
  }, [resourceMeta]);

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
      <ResourceRefsIconPopover
        isSelected={isSelected}
        isDisabled={isDisabled}
        resourceMeta={resourceMeta}
        type="incoming"
        placeholderWidth={22}
      />

      <S.ItemName isDisabled={isDisabled} isSelected={isSelected} isHighlighted={isHighlighted}>
        {kustomizationName}
      </S.ItemName>

      <ResourceRefsIconPopover
        isSelected={isSelected}
        isDisabled={isDisabled}
        resourceMeta={resourceMeta}
        type="outgoing"
        placeholderWidth={22}
      />
    </S.ItemContainer>
  );
};

export default memo(KustomizeRenderer, isEqual);
