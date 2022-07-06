import {EventEmitter} from 'events';
import _ from 'lodash';
import log from 'loglevel';

import {SectionBlueprint} from '@models/navigator';

const SectionBlueprintMap: Record<string, SectionBlueprint<any, any>> = {};

const eventEmitter = new EventEmitter();

const register = (sectionBlueprint: SectionBlueprint<any, any>) => {
  if (SectionBlueprintMap[sectionBlueprint.id]) {
    log.warn(`Overriding existing sectionBlueprint with id ${sectionBlueprint.id}`);
  }
  SectionBlueprintMap[sectionBlueprint.id] = sectionBlueprint;
  eventEmitter.emit('register', sectionBlueprint);
};

const remove = (sectionBlueprintId: string, ancestorIds: string[]) => {
  _.unset(SectionBlueprintMap, [...ancestorIds.map(id => [id, 'childSectionIds']).flat(), sectionBlueprintId]);
  _.unset(SectionBlueprintMap, sectionBlueprintId);
  eventEmitter.emit('remove', sectionBlueprintId);
};

const getAll = () => {
  return Object.values(SectionBlueprintMap);
};

const getById = (name: string): SectionBlueprint<any, any> | undefined => {
  return SectionBlueprintMap[name];
};

export default {
  getAll,
  getById,
  register,
  remove,
  eventEmitter,
};
