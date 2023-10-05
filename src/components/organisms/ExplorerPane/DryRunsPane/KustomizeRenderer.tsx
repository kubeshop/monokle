import {memo, useMemo, useState} from 'react';

import {basename, dirname} from 'path';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {useResourceMeta} from '@redux/selectors/resourceSelectors';
import {isResourceHighlighted} from '@redux/services/resource';
import {startPreview} from '@redux/thunks/preview';

import {ResourceRefsIconPopover} from '@components/molecules';

import {isEqual} from '@shared/utils/isEqual';

import * as S from './styled';

type IProps = {
  kustomizationId: string;
};

const KustomizeRenderer: React.FC<IProps> = props => {
  const {kustomizationId} = props;
  const identifier = {id: kustomizationId, storage: 'local' as const};

  const dispatch = useAppDispatch();
  const resourceMeta = useResourceMeta(identifier);
  const isHighlighted = useAppSelector(state =>
    Boolean(identifier && isResourceHighlighted(identifier, state.main.highlights))
  );
  const isPreviewed = useAppSelector(
    state => state.main.preview?.type === 'kustomize' && state.main.preview.kustomizationId === identifier.id
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
      isHovered={isHovered}
      isPreviewed={isPreviewed}
      isHighlighted={isHighlighted}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        dispatch(
          startPreview({
            type: 'kustomize',
            kustomizationId: identifier.id,
          })
        );
      }}
    >
      <ResourceRefsIconPopover
        isSelected={isPreviewed}
        resourceMeta={resourceMeta}
        type="incoming"
        placeholderWidth={22}
      />

      <S.ItemName isDisabled={false} isPreviewed={isPreviewed} isHighlighted={isHighlighted}>
        {kustomizationName}
      </S.ItemName>

      <ResourceRefsIconPopover
        isSelected={isPreviewed}
        resourceMeta={resourceMeta}
        type="outgoing"
        placeholderWidth={22}
      />
    </S.ItemContainer>
  );
};

export default memo(KustomizeRenderer, isEqual);
