import {createAsyncThunk, createNextState} from '@reduxjs/toolkit';

import fs from 'fs';
import log from 'loglevel';
import path from 'path';
import {parse} from 'yaml';

import {HELM_CHART_ENTRY_FILE} from '@constants/constants';

import {UpdateFileEntryPayload, UpdateFilesEntryPayload} from '@redux/reducers/main';
import {getLocalResourceMetasForPath} from '@redux/services/fileEntry';
import {isHelmTemplateFile, isHelmValuesFile, reprocessHelm} from '@redux/services/helm';
import {deleteResource, extractK8sResources} from '@redux/services/resource';

import {getFileStats, getFileTimestamp} from '@utils/files';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {RootState} from '@shared/models/rootState';

export const updateFileEntry = createAsyncThunk(
  'main/updateFileEntry',
  async (payload: UpdateFileEntryPayload, thunkAPI: {getState: Function; dispatch: Function}) => {
    const state: RootState = thunkAPI.getState();

    let error: any;

    const nextMainState = createNextState(state.main, mainState => {
      try {
        const fileEntry = mainState.fileMap[payload.path];
        if (!fileEntry) {
          log.error(`Could not find FileEntry for ${payload.path}`);
          return;
        }

        let rootFolder = mainState.fileMap[ROOT_FILE_ENTRY].filePath;
        const filePath = path.join(rootFolder, payload.path);

        if (getFileStats(filePath)?.isDirectory() === false) {
          fs.writeFileSync(filePath, payload.text);
          fileEntry.timestamp = getFileTimestamp(filePath);
          fileEntry.text = payload.text;

          if (path.basename(fileEntry.filePath) === HELM_CHART_ENTRY_FILE) {
            try {
              const helmChart = Object.values(mainState.helmChartMap).find(
                chart => chart.filePath === fileEntry.filePath
              );
              if (!helmChart) {
                throw new Error(`Couldn't find the helm chart for path: ${fileEntry.filePath}`);
              }
              const fileContent = parse(payload.text);
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
            getLocalResourceMetasForPath(fileEntry.filePath, mainState.resourceMetaMapByStorage.local).forEach(r => {
              deleteResource(r, {
                resourceMetaMap: mainState.resourceMetaMapByStorage.local,
                resourceContentMap: mainState.resourceContentMapByStorage.local,
              });
            });

            const extractedResources = extractK8sResources(payload.text, 'local', {
              filePath: filePath.substring(rootFolder.length),
              fileOffset: 0,
            });

            // TODO: re-implement when we have @monokle/validation
            // let resourceIds: string[] = [];
            // only recalculate refs for resources that already have refs
            // Object.values(mainState.resourceMap)
            //   .filter(r => r.refs)
            //   .forEach(r => resourceIds.push(r.id));
            // reprocessResources(
            //   schemaVersion,
            //   userDataDir,
            //   resourceIds,
            //   mainState.resourceMap,
            //   mainState.fileMap,
            //   mainState.resourceRefsProcessingOptions,
            //   {
            //     resourceKinds: extractedResources.map(r => r.kind),
            //     policyPlugins: [],
            //   });

            // TODO: is this correct?
            Object.values(extractedResources).forEach(r => {
              mainState.resourceMetaMapByStorage.local[r.id] = r;
              mainState.highlights.push({
                type: 'resource',
                resourceIdentifier: {
                  id: r.id,
                  storage: r.storage,
                },
              });
              // resourceIds.push(r.id); // this is from the commented out code above
            });

            // TODO: move the reprocessing of helm files to a redux listener, triggered after we save the file
            if (isHelmTemplateFile(fileEntry.filePath) || isHelmValuesFile(fileEntry.filePath)) {
              reprocessHelm(fileEntry.filePath, mainState.fileMap, mainState.helmTemplatesMap, mainState.helmValuesMap);
            }
          }
        }

        if (state.main.autosaving.status) {
          mainState.autosaving.status = false;
        }
      } catch (e: any) {
        const {message, stack} = e || {};
        error = {message, stack};
        log.error(e);
      }
    });

    if (error) {
      return {...state.main, autosaving: {status: false, error}};
    }

    return nextMainState;
  }
);

export const updateFileEntries = createAsyncThunk(
  'main/updateFileEntries',
  async (payload: UpdateFilesEntryPayload, thunkAPI: {getState: Function; dispatch: Function}) => {
    const state: RootState = thunkAPI.getState();

    const nextMainState: any = createNextState(state.main, mainState => {
      payload.pathes.forEach(ps => {
        const fileEntry = mainState.fileMap[ps.relativePath];
        const content = fs.readFileSync(ps.absolutePath, 'utf8');
        fileEntry.text = content;
        return {...mainState.fileMap, fileEntry};
      });
    });

    return nextMainState;
  }
);
