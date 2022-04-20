import {SectionBlueprint} from '@models/navigator';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {registerSectionBlueprint, removeSectionBlueprint} from '@redux/reducers/navigator';

import {KindHandlersEventEmitter, ResourceKindHandlers} from '@src/kindhandlers';
import sectionBlueprintMap from '@src/navsections/sectionBlueprintMap';

import {addKindHandler, addMultipleKindHandlers} from './reducers/main';
import store from './store';
import {loadPolicies} from './thunks/loadPolicies';

// load the initial kind handlers before the crds handlers are registered
store.dispatch(addMultipleKindHandlers(ResourceKindHandlers.map(k => k.kind)));

store.dispatch(loadPolicies());

KindHandlersEventEmitter.on('register', (kindHandler: ResourceKindHandler) => {
  store.dispatch(addKindHandler(kindHandler.kind));
});

sectionBlueprintMap.eventEmitter.on('register', (blueprint: SectionBlueprint<any, any>) => {
  store.dispatch(registerSectionBlueprint(blueprint.id));
});

sectionBlueprintMap.eventEmitter.on('remove', (blueprintId: string) => {
  store.dispatch(removeSectionBlueprint(blueprintId));
});
