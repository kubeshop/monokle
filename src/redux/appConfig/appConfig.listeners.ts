import {isAnyOf} from '@reduxjs/toolkit';

import {AppListenerFn} from '@redux/listeners/base';
import {getResourceKindSchema} from '@redux/services/schema';
import {setOpenProject} from '@redux/thunks/project';
import {VALIDATOR} from '@redux/validation/validator';

import {ResourceKindHandlers, readSavedCrdKindHandlers} from '@src/kindhandlers';

import {CustomSchema} from '@monokle/validation';
import {isDefined} from '@shared/utils/filter';

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

const k8sVersionSchemaListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(setOpenProject.fulfilled),
    effect: async (action, {getState}) => {
      const state = getState().config;
      const k8sVersion = state.projectConfig?.k8sVersion || state.k8sVersion;
      const userDataDir = state.userDataDir;
      if (!userDataDir) {
        return;
      }

      const schemas: CustomSchema[] = ResourceKindHandlers.filter(h => !h.isCustom)
        .map(kindHandler => {
          const schema = getResourceKindSchema(kindHandler.kind, k8sVersion, userDataDir);

          return schema
            ? {
                apiVersion: kindHandler.clusterApiVersion,
                kind: kindHandler.kind,
                schema,
              }
            : undefined;
        })
        .filter(isDefined);

      await VALIDATOR.bulkRegisterCustomSchemas(schemas);
    },
  });
};

export const appConfigListeners = [crdsPathChangedListener, k8sVersionSchemaListener];
