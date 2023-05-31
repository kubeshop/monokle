import {useCallback, useMemo} from 'react';

import {useAppSelector} from '@redux/hooks';
import {useResourceContentMap, useResourceMetaMap} from '@redux/selectors/resourceMapSelectors';
import {joinK8sResourceMap} from '@redux/services/resource';
import {problemsByResourceSelector, useValidationSelector} from '@redux/validation/validation.selectors';

import {ResourceGraph} from '@monokle/components';
import {RuleLevel} from '@monokle/validation';
import {K8sResource, ResourceMeta} from '@shared/models/k8sResource';

type IProps = {
  resource: K8sResource<'cluster'> | undefined;
};

const GraphTab: React.FC<IProps> = props => {
  const {resource} = props;

  const clusterConnectionNamespace = useAppSelector(state => state.main.clusterConnection?.namespace || '');
  const clusterResourceMetaMap = useResourceMetaMap('cluster');
  const clusterResourceContentMap = useResourceContentMap('cluster');
  const validationState = useValidationSelector(state => state);

  const resourceMap = useMemo(() => {
    const inclusionPredicate = (meta: ResourceMeta<'cluster'>) => {
      return Boolean(meta.refs && meta.refs?.length > 0);
    };

    return joinK8sResourceMap(clusterResourceMetaMap, clusterResourceContentMap, inclusionPredicate);
  }, [clusterResourceContentMap, clusterResourceMetaMap]);

  const defaultNamespace = useMemo(
    () =>
      clusterConnectionNamespace
        ? clusterConnectionNamespace !== '<all>' && clusterConnectionNamespace !== '<not-namespaced>'
          ? clusterConnectionNamespace
          : undefined
        : undefined,
    [clusterConnectionNamespace]
  );

  const elkWorker = useMemo(() => {
    return new Worker(new URL('elkjs/lib/elk-worker.min.js', import.meta.url));
  }, []);

  const getProblemsForResource = useCallback(
    (id: string, level: RuleLevel) => problemsByResourceSelector(validationState, id, level),
    [validationState]
  );

  if (!resource) {
    return null;
  }

  return (
    <ResourceGraph
      resources={[resource] as any}
      resourceMap={resourceMap as any}
      elkWorker={elkWorker}
      defaultNamespace={defaultNamespace}
      getProblemsForResource={getProblemsForResource}
    />
  );
};

export default GraphTab;
