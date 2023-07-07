import {useEffect} from 'react';

import {setDashboardActiveAccordion} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {DashboardAccordionType} from '@shared/models/dashboard';

import ClusterPane from './ClusterPane';
import * as S from './DashboardPane.style';
import HelmReleasesPane from './HelmReleasesPane';
import ImagesPane from './ImagesPane';

const accordionsKeys = ['cluster-resources', 'helm-releases', 'images'] as DashboardAccordionType[];

const DashboardPane = () => {
  const dispatch = useAppDispatch();
  const activeKey = useAppSelector(state => state.dashboard.ui.activeAccordion);
  const leftMenuSelection = useAppSelector(state => state.ui.leftMenu.selection);

  useEffect(() => {
    if (leftMenuSelection === 'helm-releases') {
      dispatch(setDashboardActiveAccordion('helm-releases'));
    }
  }, [dispatch, leftMenuSelection]);

  return (
    <S.Container>
      <S.CollapseContainer>
        <S.Collapse
          accordion
          ghost
          collapsible="header"
          activeKey={activeKey}
          onChange={(key: any = accordionsKeys.find(k => k !== activeKey)) =>
            dispatch(
              setDashboardActiveAccordion(
                Array.isArray(key) ? (key[0] as DashboardAccordionType) : (key as DashboardAccordionType)
              )
            )
          }
        >
          <ClusterPane key="cluster-resources" />
          <HelmReleasesPane key="helm-releases" />
          <ImagesPane key="images" />
        </S.Collapse>
      </S.CollapseContainer>
    </S.Container>
  );
};

export default DashboardPane;
