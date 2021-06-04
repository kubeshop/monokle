import {SELECT_FILE} from "./actionTypes";
import {AppState, FileAction} from "../models/state";

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
      resources: ["1"]
    }
  ]
}

const fileReducer = (
  state: AppState = initialState,
  action: FileAction
): AppState => {
  switch (action.type) {
    case SELECT_FILE:

      return {
        ...state,
      }
  }
  return state
}

export default fileReducer
