import {createAsyncThunk, createNextState} from '@reduxjs/toolkit';

import fs from 'fs';
import log from 'loglevel';
import path from 'path';
import {parse} from 'yaml';

import {HELM_CHART_ENTRY_FILE} from '@constants/constants';

import {UpdateFileEntryPayload} from '@redux/reducers/main';
import {getLocalResourceMetasForPath} from '@redux/services/fileEntry';
import {reprocessHelm} from '@redux/services/helm';
import {isKustomizationFile} from '@redux/services/kustomize';
import {deleteResource, extractK8sResources, splitK8sResource} from '@redux/services/resource';

import {getFileStats, getFileTimestamp} from '@utils/files';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {AppState} from '@shared/models/appState';
import {FileSideEffect} from '@shared/models/fileEntry';
import {ResourceIdentifier} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';
import {AppSelection} from '@shared/models/selection';
import {isHelmTemplateFile, isHelmValuesFile} from '@shared/utils/helm';

export const updateFileEntry = createAsyncThunk<
  {nextMainState: AppState; affectedResourceIdentifiers?: ResourceIdentifier[]},
  UpdateFileEntryPayload
>(
  'main/updateFileEntry',
  async (payload: UpdateFileEntryPayload, thunkAPI: {getState: Function; dispatch: Function}) => {
    const state: RootState = thunkAPI.getState();

    let error: any;

    const fileSideEffect: FileSideEffect = {
      affectedResourceIds: [],
    };

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
          } else if (isHelmTemplateFile(fileEntry.filePath) || isHelmValuesFile(fileEntry.filePath)) {
            // TODO: 2.0+ move the reprocessing of helm files to a redux listener, triggered after we save the file
            reprocessHelm(fileEntry.filePath, mainState.fileMap, mainState.helmTemplatesMap, mainState.helmValuesMap);
          } else {
            getLocalResourceMetasForPath(fileEntry.filePath, mainState.resourceMetaMapByStorage.local).forEach(r => {
              // TODO: 2.0+ do we have to pass the deleted resources to validation?
              fileSideEffect.affectedResourceIds.push(r.id);
              deleteResource(r, {
                resourceMetaMap: mainState.resourceMetaMapByStorage.local,
                resourceContentMap: mainState.resourceContentMapByStorage.local,
              });
            });

            const extractedResources = extractK8sResources(payload.text, 'local', {
              filePath: filePath.substring(rootFolder.length),
              fileOffset: 0,
            });

            const newHighlights: AppSelection[] = [];
            Object.values(extractedResources).forEach(r => {
              fileSideEffect.affectedResourceIds.push(r.id);
              const {meta, content} = splitK8sResource(r);
              mainState.resourceMetaMapByStorage.local[meta.id] = meta;
              mainState.resourceContentMapByStorage.local[content.id] = content;
              newHighlights.push({
                type: 'resource',
                resourceIdentifier: {
                  id: r.id,
                  storage: r.storage,
                },
              });
            });

            // did we just replace a kustomization being dry-run? -> update the kustomizationId to the new one
            // and restart the dry-run
            if (
              isKustomizationFile(fileEntry, mainState.resourceMetaMapByStorage.local) &&
              mainState.preview?.type === 'kustomize' &&
              mainState.preview.kustomizationId === fileSideEffect.affectedResourceIds[0]
            ) {
              //              mainState.preview.kustomizationId = fileSideEffect.affectedResourceIds[1];
              // thunkAPI.dispatch(stopPreview());
            }

            mainState.highlights = newHighlights;
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
      return {nextMainState: {...state.main, autosaving: {status: false, error}}};
    }

    return {
      nextMainState,
      affectedResourceIdentifiers: fileSideEffect.affectedResourceIds.map(id => ({id, storage: 'local'})),
    };
  }
);
