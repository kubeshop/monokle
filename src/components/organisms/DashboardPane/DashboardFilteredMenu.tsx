import {useEffect, useMemo, useState} from 'react';

import {useAppSelector} from '@redux/hooks';

import {DashboardMenu} from '@shared/models/dashboard';

import {MenuItem} from './MenuItem';

type IProps = {
  filterText: string;
};

const DashboardFilteredMenu: React.FC<IProps> = props => {
  const {filterText} = props;

  const menuList = useAppSelector(state => state.dashboard.ui.menuList);

  const [activeMenuItemRef, setActiveMenuItemRef] = useState<HTMLElement>();

  const filteredMenu = useMemo(() => {
    if (!filterText) {
      return menuList;
    }

    return menuList
      .map((menuItem: DashboardMenu) => ({
        ...menuItem,
        children: menuItem.children?.filter((m: DashboardMenu) =>
          m.label.toLowerCase().includes(filterText.toLowerCase())
        ),
      }))
      .filter((menuItem: DashboardMenu) => menuItem.children && menuItem.children?.length > 0);
  }, [filterText, menuList]);

  useEffect(() => {
    if (activeMenuItemRef) {
      activeMenuItemRef.scrollIntoView({behavior: 'smooth'});
    }
  }, [activeMenuItemRef]);

  return (
    <>
      {filteredMenu.map((parent: DashboardMenu) => {
        return (
          <div key={parent.key}>
            <MenuItem type="parent" menuItem={parent} onActiveMenuItem={ref => setActiveMenuItemRef(ref)} />

            {parent.children?.map((child: DashboardMenu) => (
              <MenuItem
                key={child.key}
                type="child"
                menuItem={child}
                onActiveMenuItem={ref => setActiveMenuItemRef(ref)}
              />
            ))}
          </div>
        );
      })}
    </>
  );
};

export default DashboardFilteredMenu;
