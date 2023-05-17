import {createAsyncThunk} from '@reduxjs/toolkit';

import {existsSync} from 'fs';
import {join, sep} from 'path';

import {openProject, updateProjectConfig} from '@redux/appConfig';
import {setLeftMenuSelection, toggleStartProjectPane} from '@redux/reducers/ui';
import {monitorGitFolder} from '@redux/services/gitFolderMonitor';
import {populateProjectConfig, readProjectConfig} from '@redux/services/projectConfig';
import {monitorProjectConfigFile} from '@redux/services/projectConfigMonitor';

import {PREDEFINED_K8S_VERSION} from '@shared/constants/k8s';
import {AppConfig} from '@shared/models/config';
import {UiState} from '@shared/models/ui';

import {setRootFolder} from '../setRootFolder';
import {createRejectionWithAlert} from '../utils';

export const setOpenProject = createAsyncThunk(
  'config/setOpenProject',
  async (projectRootPath: string | null, thunkAPI: any) => {
    const appConfig: AppConfig = thunkAPI.getState().config;
    const appUi: UiState = thunkAPI.getState().ui;

    if (projectRootPath && !existsSync(projectRootPath)) {
      return createRejectionWithAlert(thunkAPI, 'Project not found', 'The project folder does not exist');
    }

    if (projectRootPath && appUi.isStartProjectPaneVisible) {
      thunkAPI.dispatch(toggleStartProjectPane());
    }

    if (appUi.leftMenu.selection !== 'explorer') {
      thunkAPI.dispatch(setLeftMenuSelection('explorer'));
    }

    monitorGitFolder(projectRootPath, thunkAPI);

    const projectConfig = readProjectConfig(projectRootPath);

    monitorProjectConfigFile(thunkAPI.dispatch, projectRootPath);
    // First open the project so state.selectedProjectRootFolder is set
    thunkAPI.dispatch(openProject(projectRootPath));
    const config = projectConfig || populateProjectConfig(appConfig);

    if (
      config &&
      !(
        config.k8sVersion &&
        existsSync(join(String(appConfig.userDataDir), sep, 'schemas', `${config?.k8sVersion}.json`))
      )
    ) {
      config.k8sVersion = PREDEFINED_K8S_VERSION;
    }

    // Then set project config by reading .monokle or populating it
    thunkAPI.dispatch(updateProjectConfig({config, fromConfigFile: false}));
    // Last set rootFolder so function can read the latest projectConfig
    thunkAPI.dispatch(setRootFolder({rootFolder: projectRootPath}));
  }
);
