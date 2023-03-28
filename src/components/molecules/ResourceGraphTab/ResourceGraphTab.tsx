import {useCallback, useMemo} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectImage, selectResource} from '@redux/reducers/main';
import {setExplorerSelectedSection} from '@redux/reducers/ui';
import {
  activeResourceStorageSelector,
  useActiveResourceContentMap,
  useActiveResourceMetaMap,
} from '@redux/selectors/resourceMapSelectors';
import {useSelectedResource} from '@redux/selectors/resourceSelectors';
import {joinK8sResourceMap} from '@redux/services/resource';
import {problemsByResourceSelector, useValidationSelector} from '@redux/validation/validation.selectors';

import {ResourceGraph} from '@monokle/components';
import {RuleLevel} from '@monokle/validation';

const ResourceGraphTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeStorage = useAppSelector(activeResourceStorageSelector);
  const selectedResource = useSelectedResource();
  const resources = useMemo(() => (selectedResource ? [selectedResource] : []), [selectedResource]);
  const activeResoureMetaMap = useActiveResourceMetaMap();
  const activeResoureContentMap = useActiveResourceContentMap();
  // TODO: computing this is expensive, but the Graph is from core and it needs the resource map...
  const resourceMap = useMemo(
    () => joinK8sResourceMap(activeResoureMetaMap, activeResoureContentMap),
    [activeResoureMetaMap, activeResoureContentMap]
  );
  const validationState = useValidationSelector(state => state);

  const getProblemsForResource = useCallback(
    (id: string, level: RuleLevel) => problemsByResourceSelector(validationState, id, level),
    [validationState]
  );

  const onSelectResource = useCallback(
    (resource: any) => {
      dispatch(selectResource({resourceIdentifier: {id: resource.id, storage: activeStorage}}));
    },
    [activeStorage, dispatch]
  );
  const onSelectImage = useCallback(
    (imageId: string) => {
      dispatch(setExplorerSelectedSection('images'));
      dispatch(selectImage({imageId}));
    },
    [dispatch]
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
