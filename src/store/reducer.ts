import {SELECT_ROOT_FOLDER} from "./actionTypes";
import {AppState, FileAction, FileEntry} from "../models/state";
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
      children: [],
    }
  ],
  statusText: "Welcome!"
}

const fileReducer = (
  state: AppState = initialState,
  action: FileAction
): AppState => {
  switch (action.type) {
    case SELECT_ROOT_FOLDER:
      var rootEntry: FileEntry = action.data
      var rootFolder = path.join(rootEntry.folder, rootEntry.name);
      return {
        ...state,
        rootFolder: rootFolder,
        statusText: "Loaded folder " + rootFolder,
        files: rootEntry.children
      }
  }
  return state
}

export default fileReducer
