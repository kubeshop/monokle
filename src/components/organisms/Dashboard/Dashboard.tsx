import {useCallback, useEffect} from 'react';

import {K8sResource} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateClusterResource} from '@redux/reducers/main';
import {getNodes} from '@redux/services/clusterDashboard';
import {KubeConfigManager} from '@redux/services/kubeConfigManager';

import {useMainPaneDimensions} from '@utils/hooks';

import DaemonSetHandler from '@src/kindhandlers/DaemonSet.handler';
import DeploymentHandler from '@src/kindhandlers/Deployment.handler';
import EndpointSliceHandler from '@src/kindhandlers/EndpointSlice.handler';
import EndpointsHandler from '@src/kindhandlers/Endpoints.handler';
import IngressHandler from '@src/kindhandlers/Ingress.handler';
import NamespaceHandler from '@src/kindhandlers/Namespace.handler';
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
  CellPodsCount,
  CellPorts,
  CellRestartCount,
  CellScheduledCount,
  CellSecretType,
  CellStatus,
  CellType,
  LoadBalancerIPs,
} from './Tableview/TableCells';
import {Tableview} from './Tableview/Tableview';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeMenu = useAppSelector(state => state.dashboard.ui.activeMenu);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedNamespace = useAppSelector(state => state.dashboard.ui.selectedNamespace);
  const {height} = useMainPaneDimensions();

  useEffect(() => {
    if (activeMenu === 'Node') {
      const k8sApiClient = new KubeConfigManager().getV1ApiClient();
      if (k8sApiClient) {
        getNodes(k8sApiClient).then(n => {
          // TEMPORARY NODE ADDER
          n.forEach(node => {
            dispatch(updateClusterResource(node));
          });
        });
      }
    }
  }, [activeMenu, dispatch]);

  const filterResources = useCallback(
    (kind: string, apiVersion?: string) => {
      return Object.values(resourceMap).filter(
        (resource: K8sResource) =>
          (apiVersion ? resource.content.apiVersion === apiVersion : true) &&
          resource.kind === kind &&
          (selectedNamespace !== 'ALL' ? selectedNamespace === resource.namespace : true)
      );
    },
    [resourceMap, selectedNamespace]
  );

  return (
    <S.Container $paneHeight={height}>
      <S.Header title={activeMenu} />
      <S.Content>
        {activeMenu === 'Overview' && <Overview />}
        {activeMenu !== 'Overview' && (
          <Tableview
            dataSource={activeMenu === 'Node' ? filterResources(activeMenu, 'v1') : filterResources(activeMenu)}
            columns={resourceKindColumns[activeMenu] || resourceKindColumns['ANY']}
          />
        )}
      </S.Content>
    </S.Container>
  );
};

export default Dashboard;

export const resourceKindColumns = {
  [NamespaceHandler.kind]: [CellStatus, CellName, CellError, CellLabels, CellAge],
  [PodHandler.kind]: [CellStatus, CellName, CellNamespace, CellNode, CellRestartCount, CellAge],
  [DeploymentHandler.kind]: [CellName, CellError, CellNamespace, CellPodsCount, CellAge],
  [DaemonSetHandler.kind]: [CellName, CellError, CellNamespace, CellScheduledCount, CellNode, CellAge],
  [StatefulSetHandler.kind]: [CellName, CellError, CellNamespace, CellPodsCount, CellAge],
  [ReplicaSetHandler.kind]: [CellName, CellError, CellNamespace, CellPodsCount, CellAge],
  [ServiceHandler.kind]: [CellName, CellError, CellNamespace, CellType, CellPorts, CellIPs, LoadBalancerIPs, CellAge],
  [EndpointsHandler.kind]: [CellName, CellError, CellNamespace, CellEndpoints, CellAge],
  [EndpointSliceHandler.kind]: [CellName, CellError, CellNamespace, CellAge],
  [IngressHandler.kind]: [CellName, CellError, CellNamespace, LoadBalancerIPs, CellAge],
  [SecretHandler.kind]: [CellName, CellError, CellNamespace, CellSecretType, CellAge],
  Node: [CellName, CellAddresses, CellNamespace, CellSecretType, CellAge],
  ANY: [CellName, CellError, CellNamespace, CellAge],
};
