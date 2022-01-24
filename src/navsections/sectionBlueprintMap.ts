import {EventEmitter} from 'events';

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
    // eslint-disable-next-line no-console
    console.warn(`Overriding existing sectionBlueprint with id ${sectionBlueprint.id}`);
  }
  SectionBlueprintMap[sectionBlueprint.id] = sectionBlueprint;
  eventEmitter.emit('register', sectionBlueprint);

  const element = document.getElementById(sectionBlueprint.containerElementId);
  if (element) {
    resizeObserver.observe(element);
  }
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
  getSectionContainerElementHeight,
  eventEmitter,
};
