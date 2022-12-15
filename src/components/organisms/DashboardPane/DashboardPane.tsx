import {useCallback, useEffect, useState} from 'react';

import {FundProjectionScreenOutlined} from '@ant-design/icons';

import navSectionNames from '@constants/navSectionNames';

import {setActiveDashboardMenu, setSelectedNamespaces, setSelectedResourceId} from '@redux/dashboard/slice';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {KubeConfigManager} from '@redux/services/kubeConfigManager';

import {getRegisteredKindHandlers} from '@src/kindhandlers';

import {DashboardMenu} from '@shared/models/dashboard';
import {K8sResource} from '@shared/models/k8sResource';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';
import {trackEvent} from '@shared/utils/telemetry';

import {ErrorCell, Resource} from '../Dashboard/Tableview/TableCells.styled';
import * as S from './DashboardPane.style';

const DashboardPane = () => {
  const dispatch = useAppDispatch();
  const activeMenu = useAppSelector(state => state.dashboard.ui.activeMenu);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedNamespaces = useAppSelector(state => state.dashboard.ui.selectedNamespaces);
  const leftMenu = useAppSelector(state => state.ui.leftMenu);
  const [menu, setMenu] = useState<DashboardMenu[]>([]);
  const [filteredMenu, setFilteredMenu] = useState<any>([]);
  const [filterText, setFilterText] = useState<string>('');

  useEffect(() => {
    if (!filterText) {
      setFilteredMenu(menu);
      return;
    }

    setFilteredMenu(
      menu
        .map((menuItem: DashboardMenu) => ({
          ...menuItem,
          children: menuItem.children?.filter((m: DashboardMenu) =>
            m.label.toLowerCase().includes(filterText.toLowerCase())
          ),
        }))
        .filter((menuItem: DashboardMenu) => menuItem.children && menuItem.children?.length > 0)
        .filter(
          (menuItem: DashboardMenu) =>
            menuItem.children &&
            menuItem.children?.reduce(
              (total: number, m: DashboardMenu) => total + (m.resourceCount ? m.resourceCount : 0),
              0
            ) > 0
        )
    );
  }, [filterText, menu]);

  useEffect(() => {
    let tempMenu: DashboardMenu[] = [
      {
        key: 'Overview',
        label: 'Overview',
        children: [],
      },
    ];

    navSectionNames.representation[navSectionNames.K8S_RESOURCES].forEach((path: string) => {
      tempMenu.push({
        key: path,
        label: path,
        children: [],
      });
    });

    getRegisteredKindHandlers().forEach((kindHandler: ResourceKindHandler) => {
      const parent: DashboardMenu | undefined = tempMenu.find(m => m.key === kindHandler.navigatorPath[1]);
      if (parent) {
        const child: DashboardMenu | undefined = parent.children?.find(m => m.key === kindHandler.navigatorPath[2]);
        if (child) {
          child.children?.push({
            key: `${kindHandler.clusterApiVersion}-${kindHandler.kind}`,
            label: kindHandler.kind,
            children: [],
            resourceCount: getResourceCount(kindHandler.kind),
            errorCount: getErrorCount(kindHandler.kind),
          });
        } else {
          parent.children?.push({
            key: `${kindHandler.clusterApiVersion}-${kindHandler.kind}`,
            label: kindHandler.kind,
            children: [],
            resourceCount: getResourceCount(kindHandler.kind),
            errorCount: getErrorCount(kindHandler.kind),
          });
        }
      }
    });

    tempMenu = tempMenu.map((menuItem: DashboardMenu) => ({
      ...menuItem,
      resourceCount: menuItem.children?.reduce(
        (total: number, m: DashboardMenu) => total + (m.resourceCount ? m.resourceCount : 0),
        0
      ),
      errorCount: menuItem.children?.reduce(
        (total: number, m: DashboardMenu) => total + (m.errorCount ? m.errorCount : 0),
        0
      ),
    }));

    setMenu(tempMenu);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getRegisteredKindHandlers(), leftMenu, selectedNamespaces, resourceMap]);

  useEffect(() => {
    dispatch(setActiveDashboardMenu({key: 'Overview', label: 'Overview'}));
    dispatch(setSelectedNamespaces([]));
  }, [dispatch]);

  const setActiveMenu = (menuItem: DashboardMenu) => {
    trackEvent('dashboard/selectKind', {kind: menuItem.key});
    dispatch(setActiveDashboardMenu(menuItem));
    dispatch(setSelectedResourceId());
  };

  const getResourceCount = useCallback(
    (kind: string) => {
      return Object.values(resourceMap)
        .filter((resource: K8sResource) => resource.filePath.startsWith('preview://'))
        .filter(
          r =>
            r.kind === kind &&
            (selectedNamespaces.length > 0 && Boolean(r.namespace)
              ? selectedNamespaces.find(n => n === r.namespace)
              : true)
        ).length;
    },
    [resourceMap, selectedNamespaces]
  );

  const getErrorCount = useCallback(
    (kind: string) => {
      return Object.values(resourceMap)
        .filter((resource: K8sResource) => resource.filePath.startsWith('preview://'))
        .filter(
          resource =>
            resource.kind === kind &&
            (selectedNamespaces.length > 0 && Boolean(resource.namespace)
              ? selectedNamespaces.find(n => n === resource.namespace)
              : true)
        )
        .reduce((total: number, resource: K8sResource) => {
          if (resource.issues && resource.issues.errors) {
            total += resource.issues.errors.length;
          }
          if (resource.validation && resource.validation.errors) {
            total += resource.validation.errors.length;
          }
          return total;
        }, 0);
    },
    [resourceMap, selectedNamespaces]
  );

  return (
    <S.Container>
      <S.HeaderContainer>
        <S.ClusterName
          title={new KubeConfigManager().getKubeConfig().currentContext}
          description={
            <div>
              <S.CheckCircleFilled />
              <S.ConnectedText>Connected</S.ConnectedText>
            </div>
          }
        />

        <S.FilterContainer>
          <S.Input
            placeholder=""
            prefix={<S.SearchOutlined />}
            onChange={(event: any) => setFilterText(event.target.value)}
            allowClear
          />
        </S.FilterContainer>
      </S.HeaderContainer>

      {filteredMenu.map((parent: DashboardMenu) =>
        (parent.resourceCount && parent.resourceCount > 0) || parent.key === 'Overview' ? (
          <div key={parent.key}>
            <S.MainSection
              $clickable={parent.key === 'Overview' || parent.key === 'Node'}
              $active={activeMenu.key === parent.key}
              onClick={() => (parent.key === 'Overview' || parent.key === 'Node') && setActiveMenu(parent)}
            >
              {parent.key === 'Overview' && <FundProjectionScreenOutlined style={{marginRight: '8px'}} />}
              <span>{parent.label}</span>
            </S.MainSection>

            {parent.children?.map((child: DashboardMenu) =>
              child.resourceCount ? (
                <S.SubSection
                  key={child.key}
                  $active={activeMenu.key === child.key}
                  onClick={() => setActiveMenu(child)}
                >
                  <span style={{marginRight: '4px'}}>{child.label}</span>
                  {child.resourceCount ? <Resource>{child.resourceCount}</Resource> : null}
                  {child.errorCount ? <ErrorCell>{child.errorCount}</ErrorCell> : null}
                </S.SubSection>
              ) : null
            )}
          </div>
        ) : null
      )}
    </S.Container>
  );
};

export default DashboardPane;
