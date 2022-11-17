import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setActiveDashboardMenu} from '@redux/reducers/ui';

import ClusterRoleHandler from '@src/kindhandlers/ClusterRole.handler';
import ClusterRoleBindingHandler from '@src/kindhandlers/ClusterRoleBinding.handler';
import ConfigMapHandler from '@src/kindhandlers/ConfigMap.handler';
import CronJobHandler from '@src/kindhandlers/CronJob.handler';
import DaemonSetHandler from '@src/kindhandlers/DaemonSet.handler';
import DeploymentHandler from '@src/kindhandlers/Deployment.handler';
import EndpointSliceHandler from '@src/kindhandlers/EndpointSlice.handler';
import EndpointsHandler from '@src/kindhandlers/Endpoints.handler';
import JobHandler from '@src/kindhandlers/Job.handler';
import NamespaceHandler from '@src/kindhandlers/Namespace.handler';
import PodHandler from '@src/kindhandlers/Pod.handler';
import ReplicaSetHandler from '@src/kindhandlers/ReplicaSet.handler';
import RoleHandler from '@src/kindhandlers/Role.handler';
import RoleBindingHandler from '@src/kindhandlers/RoleBinding.handler';
import SecretHandler from '@src/kindhandlers/Secret.handler';
import ServiceHandler from '@src/kindhandlers/Service.handler';
import ServiceAccountHandler from '@src/kindhandlers/ServiceAccount.handler';
import StatefulSetHandler from '@src/kindhandlers/StatefulSet.handler';
import StorageClassHandler from '@src/kindhandlers/StorageClass.handler';

import * as S from './DashboardPane.style';

export const DashboardPane = () => {
  const dispatch = useAppDispatch();
  const activeMenu = useAppSelector(state => state.ui.dashboard.activeMenu);

  return (
    <S.Container>
      {Object.keys(SECTIONS).map(section => (
        <div key={section}>
          <S.MainSection $active={activeMenu === section} onClick={() => dispatch(setActiveDashboardMenu(section))}>
            {section}
          </S.MainSection>
          {SECTIONS[section].map((subsection: any) => (
            <S.SubSection
              key={subsection}
              $active={activeMenu === subsection}
              onClick={() => dispatch(setActiveDashboardMenu(subsection))}
            >
              {subsection}
            </S.SubSection>
          ))}
        </div>
      ))}
    </S.Container>
  );
};

export const SECTIONS: {[key: string]: Array<string>} = {
  Overview: [],
  Workloads: [
    DaemonSetHandler.kind,
    DeploymentHandler.kind,
    PodHandler.kind,
    ReplicaSetHandler.kind,
    StatefulSetHandler.kind,
    JobHandler.kind,
    CronJobHandler.kind,
  ],
  Configuration: [ConfigMapHandler.kind, NamespaceHandler.kind, SecretHandler.kind],
  Network: [EndpointsHandler.kind, EndpointSliceHandler.kind, ServiceHandler.kind],
  Storage: [StorageClassHandler.kind],
  'Access Control': [
    ClusterRoleHandler.kind,
    ClusterRoleBindingHandler.kind,
    RoleHandler.kind,
    RoleBindingHandler.kind,
    ServiceAccountHandler.kind,
  ],
};
