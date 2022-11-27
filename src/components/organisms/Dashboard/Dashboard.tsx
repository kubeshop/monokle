import {useAppSelector} from '@redux/hooks';

import {useMainPaneDimensions} from '@utils/hooks';

import DaemonSetHandler from '@src/kindhandlers/DaemonSet.handler';
import DeploymentHandler from '@src/kindhandlers/Deployment.handler';
import EndpointSliceHandler from '@src/kindhandlers/EndpointSlice.handler';
import EndpointsHandler from '@src/kindhandlers/Endpoints.handler';
import IngressHandler from '@src/kindhandlers/Ingress.handler';
import NamespaceHandler from '@src/kindhandlers/Namespace.handler';
import PodHandler from '@src/kindhandlers/Pod.handler';
import ReplicaSetHandler from '@src/kindhandlers/ReplicaSet.handler';
import ServiceHandler from '@src/kindhandlers/Service.handler';
import StatefulSetHandler from '@src/kindhandlers/StatefulSet.handler';

import * as S from './Dashboard.styled';
import {Overview} from './Overview/Overview';
import {
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
  CellStatus,
  CellType,
  LoadBalancerIPs,
} from './Tableview/TableCells';
import {Tableview} from './Tableview/Tableview';

export const Dashboard = () => {
  const activeMenu = useAppSelector(state => state.dashboard.ui.activeMenu);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedNamespace = useAppSelector(state => state.dashboard.ui.selectedNamespace);
  const {height} = useMainPaneDimensions();

  const filterResources = (kind: string) => {
    return Object.values(resourceMap).filter(
      resource =>
        resource.kind === kind && (selectedNamespace !== 'ALL' ? selectedNamespace === resource.namespace : true)
    );
  };

  return (
    <S.Container $paneHeight={height}>
      <S.Header title={activeMenu} />
      <S.Content>
        {activeMenu === 'Overview' && <Overview />}
        {activeMenu !== 'Overview' && (
          <Tableview
            dataSource={filterResources(activeMenu)}
            columns={resourceKindColumns[activeMenu] || resourceKindColumns['ANY']}
          />
        )}
      </S.Content>
    </S.Container>
  );
};

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
  ANY: [CellName, CellError, CellNamespace, CellAge],
};
