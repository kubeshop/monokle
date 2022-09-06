import {createAsyncThunk, createNextState} from '@reduxjs/toolkit';

import fs from 'fs';
import log from 'loglevel';
import path from 'path';
import {parse} from 'yaml';

import {HELM_CHART_ENTRY_FILE, ROOT_FILE_ENTRY} from '@constants/constants';

import {RootState} from '@models/rootstate';

import {setChangedFiles} from '@redux/git';
import {UpdateFileEntryPayload, UpdateFilesEntryPayload} from '@redux/reducers/main';
import {currentConfigSelector} from '@redux/selectors';
import {getResourcesForPath} from '@redux/services/fileEntry';
import {isHelmTemplateFile, isHelmValuesFile, reprocessHelm} from '@redux/services/helm';
import {getK8sVersion} from '@redux/services/projectConfig';
import {deleteResource, extractK8sResources, reprocessResources} from '@redux/services/resource';

import {getFileStats, getFileTimestamp} from '@utils/files';
import {promiseFromIpcRenderer} from '@utils/promises';

export const updateFileEntry = createAsyncThunk(
  'main/updateFileEntry',
  async (payload: UpdateFileEntryPayload, thunkAPI: {getState: Function; dispatch: Function}) => {
    const state: RootState = thunkAPI.getState();
    const projectConfig = currentConfigSelector(state);
    const schemaVersion = getK8sVersion(projectConfig);
    const userDataDir = String(state.config.userDataDir);
    const projectRootFolderPath = state.config.selectedProjectRootFolder;

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
            getResourcesForPath(fileEntry.filePath, mainState.resourceMap).forEach(r => {
              deleteResource(r, mainState.resourceMap);
            });

            const extractedResources = extractK8sResources(payload.text, filePath.substring(rootFolder.length));

            let resourceIds: string[] = [];

            // only recalculate refs for resources that already have refs
            Object.values(mainState.resourceMap)
              .filter(r => r.refs)
              .forEach(r => resourceIds.push(r.id));

            Object.values(extractedResources).forEach(r => {
              mainState.resourceMap[r.id] = r;
              r.isHighlighted = true;
              resourceIds.push(r.id);
            });

            reprocessResources(
              schemaVersion,
              userDataDir,
              resourceIds,
              mainState.resourceMap,
              mainState.fileMap,
              mainState.resourceRefsProcessingOptions,
              {
                resourceKinds: extractedResources.map(r => r.kind),
                policyPlugins: [],
              }
            );

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

    promiseFromIpcRenderer('git.getChangedFiles', 'git.getChangedFiles.result', {
      localPath: projectRootFolderPath,
      fileMap: nextMainState.fileMap,
    }).then(result => {
      thunkAPI.dispatch(setChangedFiles(result));
    });

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
