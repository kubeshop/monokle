import {useMemo} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectResource} from '@redux/reducers/main';
import {setMonacoEditor} from '@redux/reducers/ui';
import {activeResourceMetaMapSelector} from '@redux/selectors/resourceMapSelectors';
import {isResourceSelected} from '@redux/services/resource';

import {getRefRange} from '@utils/refs';

import {ResourceRef} from '@monokle/validation';
import {ResourceMeta} from '@shared/models/k8sResource';

import * as S from './ImageOutgoingResourcesPopover.styled';

interface IProps {
  resourcesIds: string[];
}

const ImageOutgoingResourcesPopover: React.FC<IProps> = ({resourcesIds}) => {
  const dispatch = useAppDispatch();
  const activeResourceMetaMap = useAppSelector(activeResourceMetaMapSelector);
  const selection = useAppSelector(state => state.main.selection);

  const refs = useMemo(() => {
    return resourcesIds.reduce((currentRefs: {[key: string]: ResourceRef[]}, id) => {
      const resourceMeta = activeResourceMetaMap[id];
      const resourceRefs = resourceMeta?.refs;

      if (!resourceRefs) {
        return currentRefs;
      }

      const imageRefs = resourceRefs.filter(ref => ref.type === 'outgoing' && ref.target?.type === 'image');

      if (imageRefs.length) {
        currentRefs[id] = imageRefs;
      }

      return currentRefs;
    }, {});
  }, [activeResourceMetaMap, resourcesIds]);

  const handleOnResourceClick = (resource: ResourceMeta, ref: ResourceRef) => {
    if (!isResourceSelected(resource, selection)) {
      dispatch(selectResource({resourceIdentifier: resource}));
    }

    const refRange = getRefRange(ref);

    if (refRange) {
      setImmediate(() => {
        dispatch(setMonacoEditor({selection: {type: 'resource', resourceId: resource.id, range: refRange}}));
      });
    }
  };

  return (
    <S.Container>
      <S.PopoverTitle>Resources Links</S.PopoverTitle>
      <S.Divider />
      {Object.entries(refs).map(([resourceId, resourceRefs]) => {
        const resourceMeta = activeResourceMetaMap[resourceId];
        return resourceRefs.map(ref => (
          <S.RefContainer key={`${resourceId}-${ref.name}-${ref.position?.line}-${ref.position?.column}`}>
            <S.RefLinkContainer>
              <S.ResourceNameLabel onClick={() => handleOnResourceClick(resourceMeta, ref)}>
                {resourceMeta.name}
              </S.ResourceNameLabel>

              <S.ResourceKindLabel>{resourceMeta.kind}</S.ResourceKindLabel>
              {ref.position && <S.PositionText>Ln {ref.position.line}</S.PositionText>}
            </S.RefLinkContainer>
          </S.RefContainer>
        ));
      })}
    </S.Container>
  );
};

export default ImageOutgoingResourcesPopover;
