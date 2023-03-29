import {useCallback, useEffect, useMemo, useState} from 'react';

import {FundProjectionScreenOutlined} from '@ant-design/icons';

import navSectionNames from '@constants/navSectionNames';

import {currentKubeContextSelector} from '@redux/appConfig';
import {setActiveDashboardMenu, setDashboardMenuList, setDashboardSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {registeredKindHandlersSelector} from '@redux/selectors/resourceKindSelectors';
import {useResourceMetaMap} from '@redux/selectors/resourceMapSelectors';
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
  const selectedNamespace = useAppSelector(state => state.main.clusterConnection?.namespace);
  const currentContext = useAppSelector(currentKubeContextSelector);
  const leftMenu = useAppSelector(state => state.ui.leftMenu);
  const [filterText, setFilterText] = useState<string>('');
  const registeredKindHandlers = useAppSelector(registeredKindHandlersSelector);
  const problems = useValidationSelector(state => problemsSelector(state));
  const clusterConnectionOptions = useAppSelector(state => state.main.clusterConnectionOptions);
  const clusterResourceMeta = useResourceMetaMap('cluster');

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
  }, [filterText, menuListRef, menuList, clusterConnectionOptions]);

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
          });
        } else {
          parent.children?.push({
            key: `${kindHandler.clusterApiVersion}-${kindHandler.kind}`,
            label: kindHandler.kind,
            children: [],
          });
        }
      }
    });

    dispatch(setDashboardMenuList(tempMenu));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registeredKindHandlers, leftMenu, selectedNamespace, clusterResourceMeta]);

  const setActiveMenu = useCallback(
    (menuItem: DashboardMenu) => {
      trackEvent('dashboard/selectKind', {kind: menuItem.key});
      dispatch(setActiveDashboardMenu(menuItem));
      dispatch(setDashboardSelectedResourceId());
    },
    [dispatch]
  );

  const compareNamespaces = useCallback(
    (namespace?: string) => {
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

  const getResources = useCallback(
    (kind: string) => {
      return Object.values(clusterResourceMeta).filter(r => r.kind === kind && compareNamespaces(r.namespace));
    },
    [clusterResourceMeta, compareNamespaces]
  );

  const getResourceCount = useCallback((kind: string) => getResources(kind).length, [getResources]);

  const getProblemCount = useCallback(
    (kind: string, level: 'error' | 'warning') => {
      return getResources(kind).reduce((total: number, resource: ResourceMeta) => {
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
    [getResources, problems]
  );

  return (
    <S.Container>
      <S.HeaderContainer>
        <S.ClusterName
          title={currentContext}
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

            {parent.children?.map((child: DashboardMenu) => {
              const resourceCount = getResourceCount(child.label);
              const errorCount = getProblemCount(child.label, 'error');
              const warningCount = getProblemCount(child.label, 'warning');
              return resourceCount ? (
                <S.SubSection
                  key={child.key}
                  $active={activeMenu.key === child.key}
                  onClick={() => setActiveMenu(child)}
                >
                  <span style={{marginRight: '4px'}}>{child.label}</span>
                  {resourceCount ? <Resource>{resourceCount}</Resource> : null}
                  {errorCount ? <ErrorCell>{errorCount}</ErrorCell> : null}
                  {warningCount ? <Warning style={{marginLeft: '8px'}}>{warningCount}</Warning> : null}
                </S.SubSection>
              ) : null;
            })}
          </div>
        ) : null
      )}
    </S.Container>
  );
};

export default DashboardPane;
