import {useCallback, useEffect, useMemo, useState} from 'react';
import {useMount} from 'react-use';

import {FundProjectionScreenOutlined} from '@ant-design/icons';

import navSectionNames from '@constants/navSectionNames';

import {setActiveDashboardMenu, setDashboardMenuList, setDashboardSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {registeredKindHandlersSelector} from '@redux/selectors/resourceKindSelectors';
import {useResourceMetaMapRef} from '@redux/selectors/resourceMapSelectors';
import {KubeConfigManager} from '@redux/services/kubeConfigManager';
import {problemsSelector, useValidationSelector} from '@redux/validation/validation.selectors';

import {useSelectorWithRef} from '@utils/hooks';

import {DashboardMenu} from '@shared/models/dashboard';
import {ResourceMeta} from '@shared/models/k8sResource';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';
import {trackEvent} from '@shared/utils/telemetry';

import {CLICKAKBLE_RESOURCE_GROUPS} from '../Dashboard';
import {ErrorCell, Resource, Warning} from '../Dashboard/Tableview/TableCells.styled';
import * as S from './DashboardPane.style';

const DashboardPane = () => {
  const dispatch = useAppDispatch();
  const activeMenu = useAppSelector(state => state.dashboard.ui.activeMenu);
  const [menuList, menuListRef] = useSelectorWithRef(state => state.dashboard.ui.menuList);
  const clusterResourceMetaMapRef = useResourceMetaMapRef('cluster');
  const selectedNamespace = useAppSelector(state => state.main.clusterConnection?.namespace);
  const leftMenu = useAppSelector(state => state.ui.leftMenu);
  const [filterText, setFilterText] = useState<string>('');
  const registeredKindHandlers = useAppSelector(registeredKindHandlersSelector);
  const problems = useValidationSelector(state => problemsSelector(state));

  const filteredMenu = useMemo(() => {
    if (!filterText) {
      return menuListRef.current;
    }
    return menuListRef.current
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
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterText, menuListRef, menuList]);

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

    registeredKindHandlers.forEach((kindHandler: ResourceKindHandler) => {
      const parent: DashboardMenu | undefined = tempMenu.find(m => m.key === kindHandler.navigatorPath[1]);
      if (parent) {
        const child: DashboardMenu | undefined = parent.children?.find(m => m.key === kindHandler.navigatorPath[2]);
        if (child) {
          child.children?.push({
            key: `${kindHandler.clusterApiVersion}-${kindHandler.kind}`,
            label: kindHandler.kind,
            children: [],
            resourceCount: getResourceCount(kindHandler.kind),
            errorCount: getProblemCount(kindHandler.kind, 'error'),
            warningCount: getProblemCount(kindHandler.kind, 'warning'),
          });
        } else {
          parent.children?.push({
            key: `${kindHandler.clusterApiVersion}-${kindHandler.kind}`,
            label: kindHandler.kind,
            children: [],
            resourceCount: getResourceCount(kindHandler.kind),
            errorCount: getProblemCount(kindHandler.kind, 'error'),
            warningCount: getProblemCount(kindHandler.kind, 'warning'),
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

    dispatch(setDashboardMenuList(tempMenu));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registeredKindHandlers, leftMenu, selectedNamespace, clusterResourceMetaMapRef, problems]);

  useMount(() => {
    dispatch(setActiveDashboardMenu({key: 'Overview', label: 'Overview'}));
  });

  const setActiveMenu = useCallback(
    (menuItem: DashboardMenu) => {
      trackEvent('dashboard/selectKind', {kind: menuItem.key});
      dispatch(setActiveDashboardMenu(menuItem));
      dispatch(setDashboardSelectedResourceId());
    },
    [dispatch]
  );

  const getResourceCount = useCallback(
    (kind: string) => {
      return Object.values(clusterResourceMetaMapRef.current).filter(r => r.kind === kind).length;
    },
    [clusterResourceMetaMapRef]
  );

  const getProblemCount = useCallback(
    (kind: string, level: 'error' | 'warning') => {
      return Object.values(clusterResourceMetaMapRef.current)
        .filter(resource => resource.kind === kind)
        .reduce((total: number, resource: ResourceMeta) => {
          const problemCount = problems
            .filter(p => p.level === level)
            .filter(p =>
              p.locations.find(
                l =>
                  l.physicalLocation?.artifactLocation.uriBaseId === 'RESOURCE' &&
                  l.physicalLocation.artifactLocation.uri === resource.id
              )
            );
          return total + problemCount.length;
        }, 0);
    },
    [clusterResourceMetaMapRef, problems]
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
        (parent.resourceCount && parent.resourceCount > 0) ||
        ['Overview', ...CLICKAKBLE_RESOURCE_GROUPS].findIndex(m => m === parent.key) > -1 ? (
          <div key={parent.key}>
            <S.MainSection
              $clickable={['Overview', ...CLICKAKBLE_RESOURCE_GROUPS].findIndex(m => m === parent.key) > -1}
              $active={activeMenu.key === parent.key}
              onClick={() =>
                ['Overview', ...CLICKAKBLE_RESOURCE_GROUPS].findIndex(m => m === parent.key) > -1
                  ? setActiveMenu(parent)
                  : undefined
              }
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
                  {child.warningCount ? <Warning style={{marginLeft: '8px'}}>{child.warningCount}</Warning> : null}
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
