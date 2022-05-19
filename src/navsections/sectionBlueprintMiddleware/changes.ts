import {shallowEqual} from 'react-redux';

import {NavigatorInstanceState} from '@models/navigator';

import {pickPartialRecord} from './utils';

export const hasNavigatorInstanceStateChanged = (
  navigatorState: NavigatorInstanceState,
  newNavigatorInstanceState: NavigatorInstanceState
) => {
  const {itemInstanceMap, sectionInstanceMap} = newNavigatorInstanceState;
  return (
    !shallowEqual(pickPartialRecord(navigatorState.itemInstanceMap, Object.keys(itemInstanceMap)), itemInstanceMap) ||
    !shallowEqual(
      pickPartialRecord(navigatorState.sectionInstanceMap, Object.keys(sectionInstanceMap)),
      sectionInstanceMap
    )
  );
};
