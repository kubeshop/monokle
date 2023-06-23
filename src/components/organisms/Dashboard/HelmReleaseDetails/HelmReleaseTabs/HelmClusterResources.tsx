import {useMemo} from 'react';

import {forEach} from 'lodash';

import {useAppSelector} from '@redux/hooks';
import {useResourceContentMap, useResourceMetaMap} from '@redux/selectors/resourceMapSelectors';

import {ResourceMeta} from '@shared/models/k8sResource';

import {TableView} from '../../TableView';
import {CellAge, CellContextMenu, CellError, CellKind, CellName, CellNamespace} from '../../TableView/TableCells';

const HelmClusterResources = () => {
  const release = useAppSelector(state => state.dashboard.helm.selectedHelmRelease!);
  const clusterResourceMeta = useResourceMetaMap('cluster');
  const clusterResourceContent = useResourceContentMap('cluster');

  const clusterResources = useMemo(() => {
    const helmResources: Array<ResourceMeta> = [];

    forEach(clusterResourceMeta, (resource: ResourceMeta) => {
      if (
        resource.labels &&
        'helm.sh/chart' in (resource.labels || {}) &&
        release.chart === resource.labels['helm.sh/chart']
      ) {
        helmResources.push({...resource, ...clusterResourceContent[resource.id]});
      }
    });
    return helmResources;
  }, [clusterResourceMeta, release.chart, clusterResourceContent]);

  return (
    <TableView
      dataSource={clusterResources}
      columns={[CellKind, CellName, CellError, CellNamespace, CellAge, CellContextMenu]}
    />
  );
};

export default HelmClusterResources;
