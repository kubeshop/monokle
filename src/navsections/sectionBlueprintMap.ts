import {EventEmitter} from 'events';
import _ from 'lodash';
import log from 'loglevel';

import {SectionBlueprint} from '@models/navigator';

const SectionBlueprintMap: Record<string, SectionBlueprint<any, any>> = {};

const eventEmitter = new EventEmitter();

const heightByContainerElementId: Record<string, number> = {};

const resizeObserver = new window.ResizeObserver(entries => {
  entries.forEach(entry => {
    const elementId = entry.target.id;
    const {height} = entry.contentRect;
    heightByContainerElementId[elementId] = height;
  });
});

const register = (sectionBlueprint: SectionBlueprint<any, any>) => {
  if (SectionBlueprintMap[sectionBlueprint.id]) {
    log.warn(`Overriding existing sectionBlueprint with id ${sectionBlueprint.id}`);
  }
  SectionBlueprintMap[sectionBlueprint.id] = sectionBlueprint;
  eventEmitter.emit('register', sectionBlueprint);

  const element = document.getElementById(sectionBlueprint.containerElementId);
  if (element) {
    resizeObserver.observe(element);
  }
};

const remove = (sectionBlueprintId: string, ancestorIds: string[]) => {
  _.unset(SectionBlueprintMap, [...ancestorIds.map(id => [id, 'childSectionIds']).flat(), sectionBlueprintId]);
  _.unset(SectionBlueprintMap, sectionBlueprintId);
  eventEmitter.emit('remove', sectionBlueprintId);
};

const getAll = () => {
  return Object.values(SectionBlueprintMap);
};

const getSectionContainerElementHeight = (sectionBlueprint: SectionBlueprint<any, any>) => {
  if (heightByContainerElementId[sectionBlueprint.containerElementId]) {
    return heightByContainerElementId[sectionBlueprint.containerElementId];
  }
  const element = document.getElementById(sectionBlueprint.containerElementId);
  if (!element) {
    return window.innerHeight;
  }
  resizeObserver.observe(element);
  return element.getBoundingClientRect().height;
};

const getById = (name: string): SectionBlueprint<any, any> | undefined => {
  return SectionBlueprintMap[name];
};

export default {
  getAll,
  getById,
  register,
  remove,
  getSectionContainerElementHeight,
  eventEmitter,
};
