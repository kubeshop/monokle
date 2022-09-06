import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {GitChangedFile, GitRepo, GitSliceState} from '@models/git';

import {setRootFolder} from '@redux/thunks/setRootFolder';

import {gitInitialState} from './git.initialState';

export const gitSlice = createSlice({
  name: 'git',
  initialState: gitInitialState,
  reducers: {
    clearRepo: (state: Draft<GitSliceState>) => {
      state.repo = undefined;
    },
    setSelectedItem: (state: Draft<GitSliceState>, action: PayloadAction<GitChangedFile>) => {
      state.selectedItem = action.payload;
    },

    setChangedFiles: (state: Draft<GitSliceState>, action: PayloadAction<GitChangedFile[]>) => {
      state.changedFiles = action.payload;
    },

    setCurrentBranch: (state: Draft<GitSliceState>, action: PayloadAction<string>) => {
      if (state.repo) {
        state.repo.currentBranch = action.payload;
      }
    },

    setRepo: (state: Draft<GitSliceState>, action: PayloadAction<GitRepo>) => {
      state.repo = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(setRootFolder.fulfilled, (state, action) => {
      state.repo = action.payload.gitRepo;
      state.changedFiles = action.payload.gitChangedFiles;
    });
  },
});

export const {clearRepo, setChangedFiles, setCurrentBranch, setSelectedItem, setRepo} = gitSlice.actions;
export default gitSlice.reducer;
