import {useCallback, useMemo} from 'react';

import {Skeleton} from 'antd';

import {useAppSelector} from '@redux/hooks';
import {useResourceContentMap, useResourceMetaMap} from '@redux/selectors/resourceMapSelectors';

import {useMainPaneDimensions} from '@utils/hooks';

import {getResourceKindHandler} from '@src/kindhandlers';
import CustomResourceDefinitionHandler from '@src/kindhandlers/CustomResourceDefinition.handler';
import DaemonSetHandler from '@src/kindhandlers/DaemonSet.handler';
import DeploymentHandler from '@src/kindhandlers/Deployment.handler';
import EndpointSliceHandler from '@src/kindhandlers/EndpointSlice.handler';
import EndpointsHandler from '@src/kindhandlers/Endpoints.handler';
import IngressHandler from '@src/kindhandlers/Ingress.handler';
import NamespaceHandler from '@src/kindhandlers/Namespace.handler';
import PersistentVolumeHandler from '@src/kindhandlers/PersistentVolume.handler';
import PersistentVolumeClaimHandler from '@src/kindhandlers/PersistentVolumeClaim.handler';
import PodHandler from '@src/kindhandlers/Pod.handler';
import ReplicaSetHandler from '@src/kindhandlers/ReplicaSet.handler';
import SecretHandler from '@src/kindhandlers/Secret.handler';
import ServiceHandler from '@src/kindhandlers/Service.handler';
import StatefulSetHandler from '@src/kindhandlers/StatefulSet.handler';

import {CLICKAKBLE_RESOURCE_GROUPS} from '.';
import * as S from './Dashboard.styled';
import {Overview} from './Overview/Overview';
import {ResourceGroupTable} from './Tableview/ResourceGroupTable';
import {
  CellAddresses,
  CellAge,
  CellContextMenu,
  CellEndpoints,
  CellError,
  CellGroup,
  CellIPs,
  CellKind,
  CellLabels,
  CellName,
  CellNamespace,
  CellNode,
  CellNodeKernel,
  CellNodeOS,
  CellNodeRoles,
  CellPodsCount,
  CellPorts,
  CellRestartCount,
  CellScheduledCount,
  CellScope,
  CellSecretType,
  CellStatus,
  CellStorageCapacity,
  CellType,
  CellVersion,
  LoadBalancerIPs,
} from './Tableview/TableCells';
import {Tableview} from './Tableview/Tableview';

const ClusterResources: React.FC = () => {
  const activeMenu = useAppSelector(state => state.dashboard.ui.activeMenu);
  const menuList = useAppSelector(state => state.dashboard.ui.menuList);
  const {height} = useMainPaneDimensions();
  const clusterConnectionOptions = useAppSelector(state => state.main.clusterConnectionOptions);
  const clusterResourceMeta = useResourceMetaMap('cluster');
  const clusterResourceContent = useResourceContentMap('cluster');

  const compareNamespaces = useCallback(
    (namespace: string) => {
      if (clusterConnectionOptions.lastNamespaceLoaded === '<all>') {
        return true;
      }
      if (clusterConnectionOptions.lastNamespaceLoaded === '<not-namespaced>') {
        return !namespace;
      }
      return clusterConnectionOptions.lastNamespaceLoaded === namespace;
    },
    [clusterConnectionOptions]
  );

  const filterResources = useCallback(() => {
    return Object.values(clusterResourceContent)
      .map(r => ({...r, ...clusterResourceMeta[r.id]}))
      .filter(resource => {
        return (
          activeMenu.key.replace(`${resource.object.apiVersion}-`, '') === resource.object.kind &&
          resource.object.kind === activeMenu.label &&
          compareNamespaces(resource.object.metadata.namespace)
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu, clusterResourceContent, clusterResourceMeta, clusterConnectionOptions]);

  const filteredResources = useMemo(() => {
    return filterResources();
  }, [filterResources]);

  const getContent = useCallback(() => {
    if (activeMenu.key === 'Overview') {
      return <Overview />;
    }
    if (CLICKAKBLE_RESOURCE_GROUPS.findIndex(m => m === activeMenu.key) > -1) {
      return (
        <ResourceGroupTable
          dataSource={
            menuList
              .find(m => m.key === activeMenu.key)
              ?.children?.map(
                k =>
                  getResourceKindHandler(k.label) && {
                    ...getResourceKindHandler(k.label),
                    menu: k,
                  }
              )
              .filter(k => Boolean(k)) || []
          }
        />
      );
    }
    if (activeMenu.key !== 'Overview') {
      return (
        <Tableview
          dataSource={filteredResources}
          columns={resourceKindColumns[activeMenu.label] || resourceKindColumns['ANY']}
        />
      );
    }
  }, [activeMenu.key, activeMenu.label, filteredResources, menuList]);

  if (clusterConnectionOptions.isLoading) {
    return (
      <S.Container $paneHeight={height} style={{padding: '16px'}}>
        <Skeleton />
      </S.Container>
    );
  }

  return (
    <S.Container $paneHeight={height}>
      <S.Header title={activeMenu.label} />
      <S.Content>{getContent()}</S.Content>
    </S.Container>
  );
};

export default ClusterResources;

export const resourceKindColumns = {
  [NamespaceHandler.kind]: [CellStatus, CellName, CellError, CellLabels, CellAge, CellContextMenu],
  [PodHandler.kind]: [
    CellStatus,
    CellName,
    CellError,
    CellNamespace,
    CellNode,
    CellRestartCount,
    CellAge,
    CellContextMenu,
  ],
  [DeploymentHandler.kind]: [CellName, CellError, CellNamespace, CellPodsCount, CellAge, CellContextMenu],
  [DaemonSetHandler.kind]: [CellName, CellError, CellNamespace, CellScheduledCount, CellAge, CellContextMenu],
  [StatefulSetHandler.kind]: [CellName, CellError, CellNamespace, CellPodsCount, CellAge, CellContextMenu],
  [ReplicaSetHandler.kind]: [CellName, CellError, CellNamespace, CellPodsCount, CellAge, CellContextMenu],
  [ServiceHandler.kind]: [
    CellName,
    CellError,
    CellNamespace,
    CellType,
    CellPorts,
    CellIPs,
    LoadBalancerIPs,
    CellAge,
    CellContextMenu,
  ],
  [EndpointsHandler.kind]: [CellName, CellError, CellNamespace, CellEndpoints, CellAge, CellContextMenu],
  [EndpointSliceHandler.kind]: [CellName, CellError, CellNamespace, CellAge, CellContextMenu],
  [IngressHandler.kind]: [CellName, CellError, CellNamespace, LoadBalancerIPs, CellAge, CellContextMenu],
  [SecretHandler.kind]: [CellName, CellError, CellNamespace, CellSecretType, CellAge, CellContextMenu],
  [PersistentVolumeClaimHandler.kind]: [
    CellName,
    CellError,
    CellNamespace,
    CellStatus,
    CellStorageCapacity,
    CellAge,
    CellContextMenu,
  ],
  [PersistentVolumeHandler.kind]: [
    CellName,
    CellError,
    CellNamespace,
    CellStatus,
    CellStorageCapacity,
    CellAge,
    CellContextMenu,
  ],
  [CustomResourceDefinitionHandler.kind]: [CellKind, CellGroup, CellVersion, CellScope, CellAge, CellContextMenu],
  Node: [CellName, CellNodeRoles, CellAddresses, CellNodeOS, CellNodeKernel, CellAge, CellContextMenu],
  ANY: [CellName, CellError, CellNamespace, CellAge, CellContextMenu],
};
