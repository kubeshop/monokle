import {NavSection} from '@models/navsection';

const NavSectionMap: Record<string, NavSection<any, any>> = {};

const getByName = (name: string) => {
  const navSection = NavSectionMap[name];
  if (!navSection) {
    throw new Error(`NavSection with name ${name} is not registered in the NavSectionMap`);
  }
  return navSection;
};

const register = (navSection: NavSection<any, any>) => {
  if (NavSectionMap[navSection.name]) {
    throw new Error(`NavSection with name ${navSection.name} already exists in the NavSectionMap`);
  }
  NavSectionMap[navSection.name] = navSection;
};

export default {
  getByName,
  register,
};
