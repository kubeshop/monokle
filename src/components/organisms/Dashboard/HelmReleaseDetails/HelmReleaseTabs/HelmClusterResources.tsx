import {useMemo} from 'react';

import {forEach} from 'lodash';

import {useAppSelector} from '@redux/hooks';
import {useResourceMetaMap} from '@redux/selectors/resourceMapSelectors';

import {ResourceMeta} from '@shared/models/k8sResource';

import {TableView} from '../../TableView';
import {CellContextMenu, CellError, CellName, CellNamespace} from '../../TableView/TableCells';

const HelmClusterResources = () => {
  const release = useAppSelector(state => state.dashboard.helm.selectedHelmRelease!);
  const clusterResourceMeta = useResourceMetaMap('cluster');
  const clusterResources = useMemo(() => {
    const helmResources: Array<ResourceMeta> = [];

    forEach(clusterResourceMeta, (resource: ResourceMeta) => {
      if (
        resource.labels &&
        'helm.sh/chart' in (resource.labels || {}) &&
        release.chart === resource.labels['helm.sh/chart']
      ) {
        helmResources.push(resource);
      }
    });
    return helmResources;
  }, [clusterResourceMeta, release.chart]);

  return <TableView dataSource={clusterResources} columns={[CellName, CellError, CellNamespace, CellContextMenu]} />;
};

export default HelmClusterResources;
