import {SET_ROOT_FOLDER} from "./actionTypes";
import {AppState, SetRootFolderAction, FileEntry} from "../models/state";
import path from "path";

const initialState: AppState = {
  rootFolder: ".",
  files: [
    {
      name: "test.yaml",
      folder: ".",
      highlight: false,
      selected: false,
      expanded: false,
      excluded: false,
      children: [],
    }
  ],
  statusText: "Welcome!",
  appConfig: {
    scanExcludes: ['node_modules', '.git']
  }
}

const fileReducer = (
  state: AppState = initialState,
  action: SetRootFolderAction
): AppState => {
  switch (action.type) {
    case SET_ROOT_FOLDER:
      if (action.rootEntry) {
        var rootEntry: FileEntry = action.rootEntry
        var rootFolder = path.join(rootEntry.folder, rootEntry.name);
        return {
          ...state,
          rootFolder: rootFolder,
          statusText: "Loaded folder " + rootFolder,
          files: rootEntry.children
        }
      }
  }
  return state
}

export default fileReducer
