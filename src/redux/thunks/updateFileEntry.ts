import {createAsyncThunk, original} from '@reduxjs/toolkit';

import fs from 'fs';
import log from 'loglevel';
import path from 'path';
import {parse} from 'yaml';

import {HELM_CHART_ENTRY_FILE, PREDEFINED_K8S_VERSION, ROOT_FILE_ENTRY} from '@constants/constants';

import {RootState} from '@models/rootstate';

import {UpdateFileEntryPayload} from '@redux/reducers/main';
import {currentConfigSelector} from '@redux/selectors';
import {getResourcesForPath} from '@redux/services/fileEntry';
import {deleteResource, extractK8sResources, reprocessResources} from '@redux/services/resource';

import {getFileStats, getFileTimestamp} from '@utils/files';

export const updateFileEntry = createAsyncThunk(
  'main/updateFileEntry',
  async (payload: UpdateFileEntryPayload, thunkAPI: {getState: Function; dispatch: Function}) => {
    const state: RootState = thunkAPI.getState();
    const projectConfig = currentConfigSelector(state);
    const schemaVersion = projectConfig.k8sVersion || PREDEFINED_K8S_VERSION;
    const userDataDir = String(state.config.userDataDir);

    try {
      const fileEntry = state.main.fileMap[payload.path];
      if (fileEntry) {
        let rootFolder = state.main.fileMap[ROOT_FILE_ENTRY].filePath;
        const filePath = path.join(rootFolder, payload.path);

        if (getFileStats(filePath)?.isDirectory() === false) {
          fs.writeFileSync(filePath, payload.content);
          fileEntry.timestamp = getFileTimestamp(filePath);

          if (path.basename(fileEntry.filePath) === HELM_CHART_ENTRY_FILE) {
            try {
              const helmChart = Object.values(state.main.helmChartMap).find(
                chart => chart.filePath === fileEntry.filePath
              );
              if (!helmChart) {
                throw new Error(`Couldn't find the helm chart for path: ${fileEntry.filePath}`);
              }
              const fileContent = parse(payload.content);
              if (typeof fileContent?.name !== 'string') {
                throw new Error(`Couldn't get the name property of the helm chart at path: ${fileEntry.filePath}`);
              }
              helmChart.name = fileContent.name;
            } catch (e) {
              if (e instanceof Error) {
                log.warn(`[updateFileEntry]: ${e.message}`);
              }
            }
          } else {
            getResourcesForPath(fileEntry.filePath, state.main.resourceMap).forEach(r => {
              deleteResource(r, state.main.resourceMap);
            });

            const extractedResources = extractK8sResources(payload.content, filePath.substring(rootFolder.length));

            let resourceIds: string[] = [];

            // only recalculate refs for resources that already have refs
            Object.values(state.main.resourceMap)
              .filter(r => r.refs)
              .forEach(r => resourceIds.push(r.id));

            Object.values(extractedResources).forEach(r => {
              state.main.resourceMap[r.id] = r;
              r.isHighlighted = true;
              resourceIds.push(r.id);
            });

            reprocessResources(
              schemaVersion,
              userDataDir,
              resourceIds,
              state.main.resourceMap,
              state.main.fileMap,
              state.main.resourceRefsProcessingOptions,
              {
                resourceKinds: extractedResources.map(r => r.kind),
              }
            );
          }
        }
      } else {
        log.error(`Could not find FileEntry for ${payload.path}`);
      }
    } catch (e) {
      log.error(e);
      return original(state);
    }
  }
);
