import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {setRootFolder} from '@redux/thunks/setRootFolder';

import {GitBranchCommit, GitChangedFile, GitRepo, GitSliceState} from '@monokle-desktop/shared';

import {gitInitialState} from './git.initialState';

export const gitSlice = createSlice({
  name: 'git',
  initialState: gitInitialState,
  reducers: {
    clearRepo: (state: Draft<GitSliceState>) => {
      state.repo = undefined;
    },

    closeGitCloneModal: (state: Draft<GitSliceState>) => {
      state.gitCloneModal.open = false;
    },

    openGitCloneModal: (state: Draft<GitSliceState>) => {
      state.gitCloneModal.open = true;
    },

    setBranchCommits: (
      state: Draft<GitSliceState>,
      action: PayloadAction<{branchName: string; commits: GitBranchCommit[]}>
    ) => {
      if (state.repo) {
        const {branchName, commits} = action.payload;

        state.repo.branchMap[branchName].commits = commits;
      }
    },

    setChangedFiles: (state: Draft<GitSliceState>, action: PayloadAction<GitChangedFile[]>) => {
      state.changedFiles = action.payload;
    },

    setCommits: (state: Draft<GitSliceState>, action: PayloadAction<{ahead: number; behind: number}>) => {
      if (state.repo) {
        state.repo.commits.ahead = action.payload.ahead;
        state.repo.commits.behind = action.payload.behind;
      }
    },

    setCurrentBranch: (state: Draft<GitSliceState>, action: PayloadAction<string>) => {
      if (state.repo) {
        state.repo.currentBranch = action.payload;
      }
    },

    setGitLoading: (state: Draft<GitSliceState>, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setHasRemoteRepo: (state: Draft<GitSliceState>, action: PayloadAction<boolean>) => {
      if (!state.repo) {
        return;
      }

      state.repo.hasRemoteRepo = action.payload;
    },

    setIsGitInstalled: (state: Draft<GitSliceState>, action: PayloadAction<boolean>) => {
      state.isGitInstalled = action.payload;
    },

    setRepo: (state: Draft<GitSliceState>, action: PayloadAction<GitRepo | undefined>) => {
      state.repo = action.payload;
    },

    setSelectedItem: (state: Draft<GitSliceState>, action: PayloadAction<GitChangedFile | undefined>) => {
      state.selectedItem = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(setRootFolder.fulfilled, (state, action) => {
      if (!action.payload.isGitRepo) {
        state.repo = undefined;
        state.changedFiles = [];
      }

      state.selectedItem = undefined;
    });
  },
});

export const {
  clearRepo,
  closeGitCloneModal,
  openGitCloneModal,
  setBranchCommits,
  setChangedFiles,
  setCommits,
  setCurrentBranch,
  setGitLoading,
  setHasRemoteRepo,
  setIsGitInstalled,
  setSelectedItem,
  setRepo,
} = gitSlice.actions;
export default gitSlice.reducer;
