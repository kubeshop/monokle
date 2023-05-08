import {useCallback, useMemo} from 'react';

import {useAppDispatch} from '@redux/hooks';
import {selectImage, selectResource} from '@redux/reducers/main';
import {setExplorerSelectedSection} from '@redux/reducers/ui';
import {
  useActiveResourceContentMap,
  useActiveResourceMetaMap,
  useResourceContentMap,
  useResourceMetaMap,
} from '@redux/selectors/resourceMapSelectors';
import {useSelectedResource} from '@redux/selectors/resourceSelectors';
import {joinK8sResourceMap} from '@redux/services/resource';
import {problemsByResourceSelector, useValidationSelector} from '@redux/validation/validation.selectors';

import {useSelectorWithRef} from '@utils/hooks';

import {ResourceGraph} from '@monokle/components';
import {RuleLevel} from '@monokle/validation';
import {trackEvent} from '@shared/utils';

const ResourceGraphTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedResource = useSelectedResource();
  const activeResoureMetaMap = useActiveResourceMetaMap();
  const activeResoureContentMap = useActiveResourceContentMap();
  const transientResourceMetaMap = useResourceMetaMap('transient');
  const transientResourceContentMap = useResourceContentMap('transient');

  const [selection, selectionRef] = useSelectorWithRef(state => state.main.selection);
  const localResourceMetaMap = useResourceMetaMap('local');

  // TODO: computing this is expensive, but the Graph is from core and it needs the resource map...
  const resourceMap = useMemo(() => {
    let result = joinK8sResourceMap(activeResoureMetaMap, activeResoureContentMap);
    let transientResources = joinK8sResourceMap(transientResourceMetaMap, transientResourceContentMap);
    Object.keys(transientResources).forEach((k: string) => {
      result[k] = transientResources[k];
    });
    return result;
  }, [activeResoureMetaMap, activeResoureContentMap, transientResourceMetaMap, transientResourceContentMap]);
  const validationState = useValidationSelector(state => state);

  const resources = useMemo(() => {
    if (selection?.type === 'file') {
      return Object.values(localResourceMetaMap).filter(r => r.origin.filePath === selection.filePath);
    }
    return selectedResource ? [selectedResource] : [];
  }, [selectedResource, selection, localResourceMetaMap]);

  const getProblemsForResource = useCallback(
    (id: string, level: RuleLevel) => problemsByResourceSelector(validationState, id, level),
    [validationState]
  );

  const onSelectResource = useCallback(
    (resource: any) => {
      if (selectionRef.current?.type !== 'file') {
        dispatch(selectResource({resourceIdentifier: {id: resource.id, storage: resourceMap[resource.id].storage}}));
        trackEvent('graph/select_resource', {kind: resourceMap[resource.id].kind});
      }
    },
    [dispatch, selectionRef, resourceMap]
  );
  const onSelectImage = useCallback(
    (imageId: string) => {
      if (selectionRef.current?.type !== 'file') {
        dispatch(setExplorerSelectedSection('images'));
        dispatch(selectImage({imageId}));
        trackEvent('graph/select_image');
      }
    },
    [dispatch, selectionRef]
  );

  const elkWorker = useMemo(() => {
    return new Worker(new URL('elkjs/lib/elk-worker.min.js', import.meta.url));
  }, []);

  return (
    <ResourceGraph
      resources={resources as any}
      resourceMap={resourceMap as any}
      getProblemsForResource={getProblemsForResource}
      onSelectResource={onSelectResource}
      onSelectImage={onSelectImage}
      elkWorker={elkWorker}
    />
  );
};

export default ResourceGraphTab;
