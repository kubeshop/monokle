import {Draft, PayloadAction, createAsyncThunk, createSlice} from '@reduxjs/toolkit';

import path from 'path';

import {ResourceValidationError} from '@models/k8sresource';
import {MonacoUiState, NewResourceWizardInput, PaneConfiguration, UiState} from '@models/ui';

import initialState from '@redux/initialState';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import electronStore from '@utils/electronStore';

export const resetLayout = createAsyncThunk('ui/resetLayout', async (_, thunkAPI) => {
  thunkAPI.dispatch(uiSlice.actions.setLeftMenuIsActive(true));
  thunkAPI.dispatch(uiSlice.actions.setRightMenuIsActive(false));
  thunkAPI.dispatch(
    uiSlice.actions.setPaneConfiguration({
      leftWidth: 0.3333,
      navWidth: 0.3333,
      editWidth: 0.3333,
      rightWidth: 0,
    })
  );
});

export const uiSlice = createSlice({
  name: 'ui',
  initialState: initialState.ui,
  reducers: {
    toggleSettings: (state: Draft<UiState>) => {
      state.isSettingsOpen = !state.isSettingsOpen;
      electronStore.set('ui.isSettingsOpen', state.isSettingsOpen);
    },
    openClusterDiff: (state: Draft<UiState>) => {
      state.isClusterDiffVisible = true;
    },
    closeClusterDiff: (state: Draft<UiState>) => {
      state.isClusterDiffVisible = false;
    },
    toggleLeftMenu: (state: Draft<UiState>) => {
      state.leftMenu.isActive = !state.leftMenu.isActive;
      electronStore.set('ui.leftMenu.isActive', state.leftMenu.isActive);
    },
    setLeftMenuIsActive: (state: Draft<UiState>, action: PayloadAction<boolean>) => {
      state.leftMenu.isActive = action.payload;
      electronStore.set('ui.leftMenu.isActive', state.leftMenu.isActive);
    },
    setLeftMenuSelection: (state: Draft<UiState>, action: PayloadAction<string>) => {
      state.leftMenu.selection = action.payload;
      electronStore.set('ui.leftMenu.selection', state.leftMenu.selection);
    },
    toggleRightMenu: (state: Draft<UiState>) => {
      state.rightMenu.isActive = !state.rightMenu.isActive;
      electronStore.set('ui.rightMenu.isActive', state.rightMenu.isActive);
    },
    toggleNotifications: (state: Draft<UiState>) => {
      state.isNotificationsOpen = !state.isNotificationsOpen;
      electronStore.set('ui.isNotificationsOpen', state.isNotificationsOpen);
    },
    setRightMenuIsActive: (state: Draft<UiState>, action: PayloadAction<boolean>) => {
      state.rightMenu.isActive = action.payload;
      electronStore.set('ui.rightMenu.isActive', state.rightMenu.isActive);
    },
    setRightMenuSelection: (state: Draft<UiState>, action: PayloadAction<string>) => {
      state.rightMenu.selection = action.payload;
      electronStore.set('ui.rightMenu.selection', state.rightMenu.selection);
    },
    setPaneConfiguration(state: Draft<UiState>, action: PayloadAction<PaneConfiguration>) {
      state.paneConfiguration = action.payload;
      electronStore.set('ui.paneConfiguration', state.paneConfiguration);
    },
    openNewResourceWizard: (
      state: Draft<UiState>,
      action: PayloadAction<{defaultInput?: NewResourceWizardInput} | undefined>
    ) => {
      state.newResourceWizard.isOpen = true;
      electronStore.set('ui.newResourceWizard.isOpen', state.newResourceWizard.isOpen);
      if (action.payload && action.payload.defaultInput) {
        state.newResourceWizard.defaultInput = action.payload.defaultInput;
      }
    },
    closeNewResourceWizard: (state: Draft<UiState>) => {
      state.newResourceWizard.isOpen = false;
      electronStore.set('ui.newResourceWizard.isOpen', state.newResourceWizard.isOpen);
      state.newResourceWizard.defaultInput = undefined;
    },
    openRenameEntityModal: (
      state: Draft<UiState>,
      action: PayloadAction<{absolutePathToEntity: string; osPlatform: string}>
    ) => {
      const getBasename = action.payload.osPlatform === 'win32' ? path.win32.basename : path.basename;

      state.renameEntityModal = {
        isOpen: true,
        entityName: getBasename(action.payload.absolutePathToEntity),
        absolutePathToEntity: action.payload.absolutePathToEntity,
      };
    },
    closeRenameEntityModal: (state: Draft<UiState>) => {
      state.renameEntityModal = {
        isOpen: false,
        entityName: '',
        absolutePathToEntity: '',
      };
    },
    openRenameResourceModal: (state: Draft<UiState>, action: PayloadAction<string>) => {
      state.renameResourceModal = {
        isOpen: true,
        resourceId: action.payload,
      };
    },
    openCreateFolderModal: (state: Draft<UiState>, action: PayloadAction<string>) => {
      state.createFolderModal = {
        isOpen: true,
        rootDir: action.payload,
      };
    },
    closeCreateFolderModal: (state: Draft<UiState>) => {
      state.createFolderModal = {
        isOpen: false,
        rootDir: '',
      };
    },
    closeRenameResourceModal: (state: Draft<UiState>) => {
      state.renameResourceModal = undefined;
    },
    collapseNavSections: (state: Draft<UiState>, action: PayloadAction<string[]>) => {
      const expandedSections = action.payload.filter(s => !state.navPane.collapsedNavSectionNames.includes(s));
      if (expandedSections.length > 0) {
        state.navPane.collapsedNavSectionNames.push(...expandedSections);
      }
    },
    expandNavSections: (state: Draft<UiState>, action: PayloadAction<string[]>) => {
      const collapsedSections = action.payload.filter(s => state.navPane.collapsedNavSectionNames.includes(s));
      if (collapsedSections.length > 0) {
        state.navPane.collapsedNavSectionNames = state.navPane.collapsedNavSectionNames.filter(
          n => !collapsedSections.includes(n)
        );
      }
    },
    showValidationErrorsModal: (state: Draft<UiState>, action: PayloadAction<ResourceValidationError[]>) => {
      state.validationErrorsModal = {
        isVisible: true,
        errors: action.payload,
      };
    },
    hideValidationErrorsModal: (state: Draft<UiState>) => {
      state.validationErrorsModal = {
        isVisible: false,
        errors: [],
      };
    },
    openFolderExplorer: (state: Draft<UiState>) => {
      state.folderExplorer = {isOpen: true};
    },
    closeFolderExplorer: (state: Draft<UiState>) => {
      state.folderExplorer = {isOpen: false};
    },
    setMonacoEditor: (state: Draft<UiState>, action: PayloadAction<Partial<MonacoUiState>>) => {
      state.monacoEditor = {
        ...state.monacoEditor,
        ...action.payload,
      };
    },
    setShouldExpandAllNodes: (state: Draft<UiState>, action: PayloadAction<boolean>) => {
      state.shouldExpandAllNodes = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(setRootFolder.pending, state => {
        state.isFolderLoading = true;
      })
      .addCase(setRootFolder.fulfilled, state => {
        state.isFolderLoading = false;
        state.shouldExpandAllNodes = true;
      })
      .addCase(setRootFolder.rejected, state => {
        state.isFolderLoading = false;
      });
  },
});

export const {
  toggleSettings,
  openClusterDiff,
  closeClusterDiff,
  toggleLeftMenu,
  toggleRightMenu,
  toggleNotifications,
  setLeftMenuSelection,
  setRightMenuSelection,
  openNewResourceWizard,
  closeNewResourceWizard,
  openRenameResourceModal,
  closeRenameResourceModal,
  collapseNavSections,
  expandNavSections,
  showValidationErrorsModal,
  hideValidationErrorsModal,
  openFolderExplorer,
  closeFolderExplorer,
  setMonacoEditor,
  setShouldExpandAllNodes,
  setPaneConfiguration,
  setRightMenuIsActive,
  setLeftMenuIsActive,
  openRenameEntityModal,
  closeRenameEntityModal,
  openCreateFolderModal,
  closeCreateFolderModal,
} = uiSlice.actions;
export default uiSlice.reducer;
