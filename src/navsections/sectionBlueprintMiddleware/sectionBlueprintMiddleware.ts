import {Middleware} from 'redux';

import {RootState} from '@models/rootstate';

import {collapseSectionIds, expandSectionIds, updateNavigatorInstanceState} from '@redux/reducers/navigator';
import {setPaneConfiguration, toggleLeftMenu, toggleResourceFilters} from '@redux/reducers/ui';

import {processSectionBlueprints} from './processor';

const sectionBlueprintMiddleware: Middleware = store => next => action => {
  next(action);
  // ignore actions that will not affect any section scope
  if (
    action?.type === updateNavigatorInstanceState.type ||
    action?.type === expandSectionIds.type ||
    action?.type === collapseSectionIds.type ||
    action?.type === toggleLeftMenu.type ||
    action?.type === setPaneConfiguration.type ||
    action?.type === toggleResourceFilters.type
  ) {
    return;
  }
  const state: RootState = store.getState();
  processSectionBlueprints(state, store.dispatch);
};

export default sectionBlueprintMiddleware;
