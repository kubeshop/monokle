import {createAsyncThunk} from '@reduxjs/toolkit';

import {createProject} from '@redux/appConfig';
import {isFolderGitRepo} from '@redux/git/git.ipc';

import {Project} from '@shared/models/config';

import {setOpenProject} from './openProject';

export const setCreateProject = createAsyncThunk('config/setCreateProject', async (project: Project, thunkAPI: any) => {
  let isGitRepo: boolean;

  try {
    isGitRepo = await isFolderGitRepo({path: project.rootFolder});
  } catch (err) {
    isGitRepo = false;
  }

  thunkAPI.dispatch(createProject({...project, isGitRepo}));
  thunkAPI.dispatch(setOpenProject(project.rootFolder));
});
