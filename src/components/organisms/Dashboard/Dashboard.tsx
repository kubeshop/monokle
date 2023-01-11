import {useCallback} from 'react';

import {K8sResource} from '@models/k8sresource';

import {useAppSelector} from '@redux/hooks';

import {useMainPaneDimensions} from '@utils/hooks';

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

import * as S from './Dashboard.styled';
import {Overview} from './Overview/Overview';
import {
  CellAddresses,
  CellAge,
  CellEndpoints,
  CellError,
  CellIPs,
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
  CellSecretType,
  CellStatus,
  CellStorageCapacity,
  CellType,
  LoadBalancerIPs,
} from './Tableview/TableCells';
import {Tableview} from './Tableview/Tableview';

const Dashboard: React.FC = () => {
  const activeMenu = useAppSelector(state => state.dashboard.ui.activeMenu);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const {height} = useMainPaneDimensions();

  const filterResources = useCallback(() => {
    return Object.values(resourceMap)
      .filter((resource: K8sResource) => resource.filePath.startsWith('preview://'))
      .filter(
        (resource: K8sResource) =>
          (activeMenu.key.split('-')[0] ? resource.content.apiVersion === activeMenu.key.split('-')[0] : true) &&
          resource.kind === activeMenu.label
      );
  }, [resourceMap, activeMenu]);

  return (
    <S.Container $paneHeight={height}>
      <S.Header title={activeMenu.label} />
      <S.Content>
        {activeMenu.key === 'Overview' && <Overview />}
        {activeMenu.key !== 'Overview' && (
          <Tableview
            dataSource={filterResources()}
            columns={resourceKindColumns[activeMenu.label] || resourceKindColumns['ANY']}
          />
        )}
      </S.Content>
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
  Node: [CellName, CellNodeRoles, CellAddresses, CellNodeOS, CellNodeKernel, CellAge],
  ANY: [CellName, CellError, CellNamespace, CellAge],
};
