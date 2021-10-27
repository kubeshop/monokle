import {SectionBlueprint} from '@models/navigator';

const SectionBlueprintMap: Record<string, SectionBlueprint<any, any>> = {};

const getById = (name: string) => {
  const navSection = SectionBlueprintMap[name];
  if (!navSection) {
    throw new Error(`NavSection with name ${name} is not registered in the SectionBlueprintMap`);
  }
  return navSection;
};

const register = (sectionBlueprint: SectionBlueprint<any, any>) => {
  if (SectionBlueprintMap[sectionBlueprint.id]) {
    throw new Error(`sectionBlueprint with id ${sectionBlueprint.id} already exists in the SectionBlueprintMap`);
  }
  SectionBlueprintMap[sectionBlueprint.id] = sectionBlueprint;
};

const getAll = () => {
  return Object.values(SectionBlueprintMap);
};

export default {
  getAll,
  getById,
  register,
};
