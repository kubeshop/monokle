import {useMemo} from 'react';

import {K8sResource, ResourceRef} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectK8sResource} from '@redux/reducers/main';
import {setMonacoEditor} from '@redux/reducers/ui';

import {getRefRange} from '@utils/refs';

import * as S from './ImageOutgoingResourcesPopover.styled';

interface IProps {
  resourcesIds: string[];
}

const ImageOutgoingResourcesPopover: React.FC<IProps> = ({resourcesIds}) => {
  const dispatch = useAppDispatch();
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);

  const refs = useMemo(() => {
    return resourcesIds.reduce((currentRefs: {[key: string]: ResourceRef[]}, id) => {
      const resource = resourceMap[id];
      const resourceRefs = resource.refs;

      if (!resourceRefs) {
        return currentRefs;
      }

      const imageRefs = resourceRefs.filter(ref => ref.type === 'outgoing' && ref.target?.type === 'image');

      if (imageRefs.length) {
        currentRefs[id] = imageRefs;
      }

      return currentRefs;
    }, {});
  }, [resourceMap, resourcesIds]);

  const handleOnResourceClick = (resource: K8sResource, ref: ResourceRef) => {
    if (selectedResourceId !== resource.id) {
      dispatch(selectK8sResource({resourceId: resource.id}));
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
        const resource = resourceMap[resourceId];
        return resourceRefs.map(ref => (
          <S.RefContainer key={`${resourceId}-${ref.name}-${ref.position?.line}-${ref.position?.column}`}>
            <S.RefLinkContainer>
              <S.ResourceNameLabel onClick={() => handleOnResourceClick(resource, ref)}>
                {resource.name}
              </S.ResourceNameLabel>

              <S.ResourceKindLabel>{resource.kind}</S.ResourceKindLabel>
              {ref.position && <S.PositionText>Ln {ref.position.line}</S.PositionText>}
            </S.RefLinkContainer>
          </S.RefContainer>
        ));
      })}
    </S.Container>
  );
};

export default ImageOutgoingResourcesPopover;
