import {setDashboardActiveAccordion} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {DashboardAccordionType} from '@shared/models/dashboard';

import ClusterPane from './ClusterPane';
import * as S from './DashboardPane.style';
import HelmReleasesPane from './HelmReleasesPane';

const DashboardPane = () => {
  const dispatch = useAppDispatch();
  const activeKey = useAppSelector(state => state.dashboard.ui.activeAccordion);

  return (
    <S.Container>
      <S.CollapseContainer>
        <S.Collapse
          accordion
          ghost
          collapsible="header"
          activeKey={activeKey}
          onChange={(key: any = activeKey === 'cluster-resources' ? 'helm-releases' : 'cluster-resources') =>
            dispatch(
              setDashboardActiveAccordion(
                Array.isArray(key) ? (key[0] as DashboardAccordionType) : (key as DashboardAccordionType)
              )
            )
          }
        >
          <ClusterPane key="cluster-resources" />
          <HelmReleasesPane key="helm-releases" />
        </S.Collapse>
      </S.CollapseContainer>
    </S.Container>
  );
};

export default DashboardPane;
