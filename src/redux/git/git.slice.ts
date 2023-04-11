import {Draft, PayloadAction, createSlice} from '@reduxjs/toolkit';

import {setRootFolder} from '@redux/thunks/setRootFolder';

import {GitAheadBehindCommitsCountResult} from '@shared/ipc';
import {GitBranchCommit, GitChangedFile, GitRemoteRepo, GitRepo, GitSliceState} from '@shared/models/git';

import {gitInitialState} from './git.initialState';

export const gitSlice = createSlice({
  name: 'git',
  initialState: gitInitialState,
  reducers: {
    addGitBranch: (state: Draft<GitSliceState>, action: PayloadAction<string>) => {
      if (!state.repo) {
        return;
      }

      state.repo.branches.push(action.payload);
    },

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

    setCurrentBranch: (state: Draft<GitSliceState>, action: PayloadAction<string>) => {
      if (state.repo) {
        state.loading = true;
        state.repo.currentBranch = action.payload;
      }
    },

    setGitLoading: (state: Draft<GitSliceState>, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
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

    updateRemoteRepo: (state: Draft<GitSliceState>, action: PayloadAction<GitRemoteRepo>) => {
      if (!state.repo) {
        return;
      }

      state.repo.remoteRepo = action.payload;
    },

    setCommitsCount: (state: Draft<GitSliceState>, action: PayloadAction<GitAheadBehindCommitsCountResult>) => {
      if (!state.repo) {
        return;
      }

      state.repo.commits.ahead = action.payload.aheadCount;
      state.repo.commits.behind = action.payload.behindCount;
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
  addGitBranch,
  clearRepo,
  closeGitCloneModal,
  openGitCloneModal,
  setBranchCommits,
  setChangedFiles,
  setCommitsCount,
  setCurrentBranch,
  setGitLoading,
  setIsGitInstalled,
  setSelectedItem,
  setRepo,
  updateRemoteRepo,
} = gitSlice.actions;
export default gitSlice.reducer;
