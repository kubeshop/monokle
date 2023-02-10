import {useCallback, useMemo} from 'react';

import {useAppSelector} from '@redux/hooks';
import {useResourceMetaMapRef} from '@redux/selectors/resourceMapSelectors';

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

const Dashboard: React.FC = () => {
  const activeMenu = useAppSelector(state => state.dashboard.ui.activeMenu);
  const menuList = useAppSelector(state => state.dashboard.ui.menuList);
  const clusterResourceMapRef = useResourceMetaMapRef('cluster');
  const {height} = useMainPaneDimensions();

  const filterResources = useCallback(() => {
    return Object.values(clusterResourceMapRef.current).filter(
      resource =>
        activeMenu.key.replace(`${resource.apiVersion}-`, '') === resource.kind && resource.kind === activeMenu.label
    );
  }, [activeMenu, clusterResourceMapRef]);

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
  }, [activeMenu, filterResources, menuList]);

  return (
    <S.Container $paneHeight={height}>
      <S.Header title={activeMenu.label} />
      <S.Content>{getContent()}</S.Content>
    </S.Container>
  );
};

export default Dashboard;

export const resourceKindColumns = {
  [NamespaceHandler.kind]: [CellStatus, CellName, CellError, CellLabels, CellAge],
  [PodHandler.kind]: [CellStatus, CellName, CellError, CellNamespace, CellNode, CellRestartCount, CellAge],
  [DeploymentHandler.kind]: [CellName, CellError, CellNamespace, CellPodsCount, CellAge],
  [DaemonSetHandler.kind]: [CellName, CellError, CellNamespace, CellScheduledCount, CellAge],
  [StatefulSetHandler.kind]: [CellName, CellError, CellNamespace, CellPodsCount, CellAge],
  [ReplicaSetHandler.kind]: [CellName, CellError, CellNamespace, CellPodsCount, CellAge],
  [ServiceHandler.kind]: [CellName, CellError, CellNamespace, CellType, CellPorts, CellIPs, LoadBalancerIPs, CellAge],
  [EndpointsHandler.kind]: [CellName, CellError, CellNamespace, CellEndpoints, CellAge],
  [EndpointSliceHandler.kind]: [CellName, CellError, CellNamespace, CellAge],
  [IngressHandler.kind]: [CellName, CellError, CellNamespace, LoadBalancerIPs, CellAge],
  [SecretHandler.kind]: [CellName, CellError, CellNamespace, CellSecretType, CellAge],
  [PersistentVolumeClaimHandler.kind]: [CellName, CellError, CellNamespace, CellStatus, CellStorageCapacity, CellAge],
  [PersistentVolumeHandler.kind]: [CellName, CellError, CellNamespace, CellStatus, CellStorageCapacity, CellAge],
  [CustomResourceDefinitionHandler.kind]: [CellKind, CellGroup, CellVersion, CellScope, CellAge],
  Node: [CellName, CellNodeRoles, CellAddresses, CellNodeOS, CellNodeKernel, CellAge],
  ANY: [CellName, CellError, CellNamespace, CellAge],
};
