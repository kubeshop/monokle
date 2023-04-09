import {useCallback, useEffect, useMemo, useState} from 'react';

import navSectionNames from '@constants/navSectionNames';

import {currentKubeContextSelector} from '@redux/appConfig';
import {setDashboardMenuList} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {registeredKindHandlersSelector} from '@redux/selectors/resourceKindSelectors';
import {useResourceMetaMap} from '@redux/selectors/resourceMapSelectors';
import {problemsSelector, useValidationSelector} from '@redux/validation/validation.selectors';

import {useRefSelector, useSelectorWithRef} from '@utils/hooks';

import {DashboardMenu} from '@shared/models/dashboard';
import {ResourceMeta} from '@shared/models/k8sResource';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';

import * as S from './DashboardPane.style';
import {MenuItem} from './MenuItem';

const ignoredResourceVersions = ['events.k8s.io/v1'];

const DashboardPane = () => {
  const dispatch = useAppDispatch();
  const [menuList, menuListRef] = useSelectorWithRef(state => state.dashboard.ui.menuList);
  const selectedNamespace = useAppSelector(state => state.main.clusterConnection?.namespace);
  const currentContext = useAppSelector(currentKubeContextSelector);
  const leftMenu = useAppSelector(state => state.ui.leftMenu);
  const [filterText, setFilterText] = useState<string>('');
  const registeredKindHandlers = useAppSelector(registeredKindHandlersSelector);
  const clusterConnectionOptions = useRefSelector(state => state.main.clusterConnectionOptions);
  const clusterResourceMeta = useResourceMetaMap('cluster');
  const [activeMenuItemRef, setActiveMenuItemRef] = useState<HTMLElement>();
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
      if (ignoredResourceVersions.find(v => v === kindHandler.clusterApiVersion)) {
        return;
      }
      const parent: DashboardMenu | undefined = tempMenu.find(m => m.key === kindHandler.navigatorPath[1]);
      if (parent) {
        const child: DashboardMenu | undefined = parent.children?.find(m => m.key === kindHandler.navigatorPath[2]);
        if (child) {
          child.children?.push({
            key: `${kindHandler.clusterApiVersion}-${kindHandler.kind}`,
            label: kindHandler.kind,
            errorCount: getProblemCount(kindHandler.kind, 'error'),
            warningCount: getProblemCount(kindHandler.kind, 'warning'),
            resourceCount: getResourceCount(kindHandler.kind),
            children: [],
          });
        } else {
          parent.children?.push({
            key: `${kindHandler.clusterApiVersion}-${kindHandler.kind}`,
            label: kindHandler.kind,
            errorCount: getProblemCount(kindHandler.kind, 'error'),
            warningCount: getProblemCount(kindHandler.kind, 'warning'),
            resourceCount: getResourceCount(kindHandler.kind),
            children: [],
          });
        }
      }
    });

    dispatch(setDashboardMenuList(tempMenu));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registeredKindHandlers, leftMenu, selectedNamespace, clusterResourceMeta]);

  useEffect(() => {
    if (activeMenuItemRef) {
      activeMenuItemRef.scrollIntoView({behavior: 'smooth'});
    }
  }, [activeMenuItemRef]);

  const compareNamespaces = useCallback(
    (namespace?: string) => {
      if (clusterConnectionOptions.current.lastNamespaceLoaded === '<all>') {
        return true;
      }
      if (clusterConnectionOptions.current.lastNamespaceLoaded === '<not-namespaced>') {
        return !namespace;
      }
      return clusterConnectionOptions.current.lastNamespaceLoaded === namespace;
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

      {filteredMenu.map((parent: DashboardMenu) => {
        return (
          <div key={parent.key}>
            <MenuItem
              type="parent"
              menuItem={parent}
              onActiveMenuItem={(ref: HTMLElement) => setActiveMenuItemRef(ref)}
            />

            {parent.children?.map((child: DashboardMenu) => (
              <MenuItem
                type="child"
                menuItem={child}
                onActiveMenuItem={(ref: HTMLElement) => setActiveMenuItemRef(ref)}
              />
            ))}
          </div>
        );
      })}
    </S.Container>
  );
};

export default DashboardPane;
