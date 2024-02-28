import {pathExists} from 'fs-extra';
import log from 'loglevel';

import {AppListenerFn} from '@redux/listeners/base';

import {readSavedCrdKindHandlers} from '@src/kindhandlers';

import {createFolder} from '@shared/utils';

import {setUserDirs} from './appConfig.slice';

const crdsPathChangedListener: AppListenerFn = listen => {
  listen({
    type: setUserDirs.type,
    effect: async (action, {getState}) => {
      const crdsDir = getState().config.userCrdsDir;

      if (crdsDir) {
        if (!(await pathExists(crdsDir))) {
          try {
            log.info(`Creating CRDs directory at ${crdsDir}.`);
            await createFolder(crdsDir);
          } catch {
            log.warn(`Failed to create CRDs directory at ${crdsDir}.`);
          }
        }

        // TODO: can we avoid having this property on the window object?
        (window as any).monokleUserCrdsDir = crdsDir;
        readSavedCrdKindHandlers(crdsDir);
      }
    },
  });
};

export const appConfigListeners = [crdsPathChangedListener];
