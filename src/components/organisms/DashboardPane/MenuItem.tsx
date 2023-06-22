import {useCallback, useEffect, useRef, useState} from 'react';

import {FundProjectionScreenOutlined} from '@ant-design/icons';

import {setActiveDashboardMenu, setDashboardSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {DashboardMenu} from '@shared/models/dashboard';
import {trackEvent} from '@shared/utils';

import {CLICKAKBLE_RESOURCE_GROUPS} from '../Dashboard';
import {ErrorCell, Resource, Warning} from '../Dashboard/TableView/TableCells.styled';
import * as S from './DashboardPane.style';

export const MenuItem = ({
  type,
  menuItem,
  onActiveMenuItem,
}: {
  type: 'parent' | 'child';
  menuItem: DashboardMenu;
  onActiveMenuItem?: (menuItemRef: HTMLDivElement) => void;
}) => {
  const activeMenu = useAppSelector(state => state.dashboard.ui.activeMenu);
  const dispatch = useAppDispatch();
  const menuItemRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    if (onActiveMenuItem && activeMenu.key === menuItem.key && menuItemRef && menuItemRef.current) {
      onActiveMenuItem(menuItemRef.current);
    }
  }, [activeMenu, onActiveMenuItem, menuItem.key]);

  const setActiveMenu = useCallback(
    (item: DashboardMenu) => {
      trackEvent('dashboard/selectKind', {kind: item.key});
      dispatch(setActiveDashboardMenu(item));
      dispatch(setDashboardSelectedResourceId());
    },
    [dispatch]
  );

  if (type === 'parent') {
    return (
      <S.MainSection
        ref={menuItemRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        $isHovered={isHovered}
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

  if (type === 'child') {
    return (
      <S.SubSection
        ref={menuItemRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        $isHovered={isHovered}
        $active={activeMenu.key === menuItem.key}
        onClick={() => setActiveMenu(menuItem)}
      >
        <span style={{marginRight: '4px'}}>{menuItem.label}</span>
        <Resource>{menuItem.resourceCount}</Resource>
        {menuItem.errorCount ? <ErrorCell>{menuItem.errorCount}</ErrorCell> : null}
        {menuItem.warningCount ? <Warning style={{marginLeft: '8px'}}>{menuItem.warningCount}</Warning> : null}
      </S.SubSection>
    );
  }
  return null;
};
