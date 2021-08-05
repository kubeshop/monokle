import {createAsyncThunk} from '@reduxjs/toolkit';
import {SetPreviewDataPayload} from '@redux/reducers/main';
import {AppDispatch, RootState} from '@redux/store';
import {ROOT_FILE_ENTRY} from '@src/constants';
import path from 'path';
import fs from 'fs';
import log from 'loglevel';
import {ipcRenderer} from 'electron';
import {createPreviewRejection, createPreviewResult} from '@redux/reducers/thunks/utils';

/**
 * Thunk to preview a Helm Chart
 */

export const previewHelmValuesFile = createAsyncThunk<
  SetPreviewDataPayload,
  string,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/previewHelmValuesFile', async (valuesFileId, thunkAPI) => {
  const configState = thunkAPI.getState().config;
  const state = thunkAPI.getState().main;
  const kubeconfig = thunkAPI.getState().config.kubeconfig;
  if (state.previewValuesFile !== valuesFileId) {
    const valuesFile = state.helmValuesMap[valuesFileId];
    if (valuesFile && valuesFile.filePath) {
      const rootFolder = state.fileMap[ROOT_FILE_ENTRY].filePath;
      const folder = path.join(rootFolder, valuesFile.filePath.substr(0, valuesFile.filePath.lastIndexOf(path.sep)));
      const chart = state.helmChartMap[valuesFile.helmChart];

      // sanity check
      if (fs.existsSync(folder) && fs.existsSync(path.join(folder, valuesFile.name))) {
        log.info(
          `previewing ${valuesFile.name} in folder ${folder} using ${configState.settings.helmPreviewMode} mode`
        );

        const args = {
          helmCommand:
            configState.settings.helmPreviewMode === 'template'
              ? `helm template -f ${valuesFile.name} ${chart.name} .`
              : `helm install -f ${valuesFile.name} ${chart.name} . --dry-run`,
          cwd: folder,
          kubeconfig,
        };

        const result = await runHelm(args);

        if (result.error) {
          return createPreviewRejection(thunkAPI, 'Helm Error', result.error);
        }

        if (result.stdout) {
          return createPreviewResult(result.stdout, valuesFile.id);
        }
      }

      return createPreviewRejection(
        thunkAPI,
        'Helm Error',
        `Unabled to run Helm for ${valuesFile.name} in folder ${folder}`
      );
    }
  }

  return {};
});

/**
 * Invokes Helm in main thread
 */

function runHelm(cmd: any): any {
  return new Promise(resolve => {
    ipcRenderer.once('helm-result', (event, arg) => {
      resolve(arg);
    });
    ipcRenderer.send('run-helm', cmd);
  });
}
