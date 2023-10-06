import {memo, useMemo, useState} from 'react';

import {basename, dirname} from 'path';

import {useAppSelector} from '@redux/hooks';
import {useResourceMeta} from '@redux/selectors/resourceSelectors';
import {isResourceHighlighted} from '@redux/services/resource';

import {ResourceRefsIconPopover} from '@components/molecules';

import {KustomizePreview} from '@shared/models/preview';
import {isEqual} from '@shared/utils/isEqual';

import {usePreviewTrigger} from './usePreviewTrigger';

import * as S from './styled';

type IProps = {
  kustomizationId: string;
};

const KustomizeRenderer: React.FC<IProps> = props => {
  const {kustomizationId} = props;
  const identifier = {id: kustomizationId, storage: 'local' as const};

  const resourceMeta = useResourceMeta(identifier);
  const isHighlighted = useAppSelector(state =>
    Boolean(identifier && isResourceHighlighted(identifier, state.main.highlights))
  );
  const isPreviewed = useAppSelector(
    state => state.main.preview?.type === 'kustomize' && state.main.preview.kustomizationId === identifier.id
  );
  const thisPreview: KustomizePreview = {
    type: 'kustomize',
    kustomizationId: identifier.id,
  };
  const {isOptimisticLoading, triggerPreview} = usePreviewTrigger(thisPreview);
  const mightBePreview = isPreviewed || isOptimisticLoading;

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
      isPreviewed={mightBePreview}
      isHighlighted={isHighlighted}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={triggerPreview}
    >
      <ResourceRefsIconPopover
        isSelected={mightBePreview}
        resourceMeta={resourceMeta}
        type="incoming"
        placeholderWidth={22}
      />

      <S.ItemName isDisabled={false} isPreviewed={mightBePreview} isHighlighted={isHighlighted}>
        {kustomizationName}
      </S.ItemName>

      <ResourceRefsIconPopover
        isSelected={mightBePreview}
        resourceMeta={resourceMeta}
        type="outgoing"
        placeholderWidth={22}
      />

      {isOptimisticLoading && <S.ReloadIcon spin />}
    </S.ItemContainer>
  );
};

export default memo(KustomizeRenderer, isEqual);
