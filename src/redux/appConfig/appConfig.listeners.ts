import {AppListenerFn} from '@redux/listeners/base';

import {readSavedCrdKindHandlers} from '@src/kindhandlers';

import {setUserDirs} from './appConfig.slice';

const crdsPathChangedListener: AppListenerFn = listen => {
  listen({
    type: setUserDirs.type,
    effect: async (action, {getState}) => {
      const crdsDir = getState().config.userCrdsDir;

      if (crdsDir) {
        // TODO: can we avoid having this property on the window object?
        (window as any).monokleUserCrdsDir = crdsDir;
        readSavedCrdKindHandlers(crdsDir);
      }
    },
  });
};

export const appConfigListeners = [crdsPathChangedListener];
