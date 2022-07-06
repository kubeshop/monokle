import {SectionBlueprint} from '@models/navigator';
import {ResourceKindHandler} from '@models/resourcekindhandler';

import {KindHandlersEventEmitter, ResourceKindHandlers} from '@src/kindhandlers';
import sectionBlueprintMap from '@src/navsections/sectionBlueprintMap';
import {
  createRootSectionListener,
  createSectionBlueprintListener,
} from '@src/navsections/sectionBlueprintMiddleware/navigatorListeners';

import {registerListener} from './listeners/base';
import {addKindHandler, addMultipleKindHandlers} from './reducers/main';
import store from './store';
import {loadPolicies} from './thunks/loadPolicies';

// load the initial kind handlers before the crds handlers are registered
store.dispatch(addMultipleKindHandlers(ResourceKindHandlers.map(k => k.kind)));

store.dispatch(loadPolicies());

KindHandlersEventEmitter.on('register', (kindHandler: ResourceKindHandler) => {
  store.dispatch(addKindHandler(kindHandler.kind));
});

sectionBlueprintMap.eventEmitter.on('register', (sectionBlueprint: SectionBlueprint<any, any>) => {
  registerListener(createSectionBlueprintListener(sectionBlueprint));
  if (sectionBlueprint.id === sectionBlueprint.rootSectionId) {
    registerListener(createRootSectionListener(sectionBlueprint.id));
  }
});

sectionBlueprintMap.eventEmitter.on('remove', (blueprintId: string) => {
  // TODO: unregister the RTK listener for this blueprint
});
