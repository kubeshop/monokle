import {createAsyncThunk} from '@reduxjs/toolkit';

import {deleteProject} from '@redux/appConfig';

import {Project} from '@shared/models/config';

import {setOpenProject} from './openProject';

export const setDeleteProject = createAsyncThunk('config/setDeleteProject', async (project: Project, thunkAPI: any) => {
  const selectedProjectRootFolder: string = thunkAPI.getState().config.selectedProjectRootFolder;
  thunkAPI.dispatch(deleteProject(project));

  if (project.rootFolder === selectedProjectRootFolder) {
    thunkAPI.dispatch(setOpenProject(null));
  }
});
