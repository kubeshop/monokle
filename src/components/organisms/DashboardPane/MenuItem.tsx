import {useCallback, useEffect, useRef, useState} from 'react';

import {FundProjectionScreenOutlined} from '@ant-design/icons';

import {setActiveDashboardMenu, setDashboardSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {useResourceMetaMap} from '@redux/selectors/resourceMapSelectors';
import {problemsSelector, useValidationSelector} from '@redux/validation/validation.selectors';

import {DashboardMenu} from '@shared/models/dashboard';
import {ResourceMeta} from '@shared/models/k8sResource';
import {trackEvent} from '@shared/utils';

import {CLICKAKBLE_RESOURCE_GROUPS} from '../Dashboard';
import {ErrorCell, Resource, Warning} from '../Dashboard/Tableview/TableCells.styled';
import * as S from './DashboardPane.style';

export const MenuItem = ({
  type,
  menuItem,
  onActiveMenuItem,
}: {
  type: 'parent' | 'child';
  menuItem: DashboardMenu;
  onActiveMenuItem?: Function;
}) => {
  const clusterResourceMeta = useResourceMetaMap('cluster');
  const clusterConnectionOptions = useAppSelector(state => state.main.clusterConnectionOptions);
  const problems = useValidationSelector(state => problemsSelector(state));
  const activeMenu = useAppSelector(state => state.dashboard.ui.activeMenu);
  const dispatch = useAppDispatch();
  const [counts, setCounts] = useState({resourceCount: 0, errorCount: 0, warningCount: 0});
  const menuItemRef = useRef(null);
  const [menuItemClicked, setMenuItemClicked] = useState(false);

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

  useEffect(() => {
    if (onActiveMenuItem && !menuItemClicked && activeMenu.key === menuItem.key && menuItemRef && menuItemRef.current) {
      onActiveMenuItem(menuItemRef.current);
      setMenuItemClicked(false);
    }
  }, [activeMenu]);

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

  const setActiveMenu = useCallback(
    (item: DashboardMenu) => {
      trackEvent('dashboard/selectKind', {kind: item.key});
      dispatch(setActiveDashboardMenu(item));
      dispatch(setDashboardSelectedResourceId());
      setMenuItemClicked(true);
    },
    [dispatch]
  );

  useEffect(() => {
    setCounts({
      resourceCount: getResourceCount(menuItem.label),
      errorCount: getProblemCount(menuItem.label, 'error'),
      warningCount: getProblemCount(menuItem.label, 'warning'),
    });
  }, [getResourceCount, getProblemCount, menuItem.label]);

  if (type === 'parent') {
    return (
      <S.MainSection
        ref={menuItemRef}
        $clickable={['Overview', ...CLICKAKBLE_RESOURCE_GROUPS].findIndex(m => m === menuItem.key) > -1}
        $active={activeMenu.key === menuItem.key}
        onClick={() =>
          ['Overview', ...CLICKAKBLE_RESOURCE_GROUPS].findIndex(m => m === menuItem.key) > -1
            ? setActiveMenu(menuItem)
            : undefined
        }
      >
        {menuItem.key === 'Overview' && <FundProjectionScreenOutlined style={{marginRight: '8px'}} />}
        <span>{menuItem.label}</span>
      </S.MainSection>
    );
  }

  if (type === 'child' && counts.resourceCount) {
    return (
      <S.SubSection ref={menuItemRef} $active={activeMenu.key === menuItem.key} onClick={() => setActiveMenu(menuItem)}>
        <span style={{marginRight: '4px'}}>{menuItem.label}</span>
        {counts.resourceCount ? <Resource>{counts.resourceCount}</Resource> : null}
        {counts.errorCount ? <ErrorCell>{counts.errorCount}</ErrorCell> : null}
        {counts.warningCount ? <Warning style={{marginLeft: '8px'}}>{counts.warningCount}</Warning> : null}
      </S.SubSection>
    );
  }
  return null;
};
