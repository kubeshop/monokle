import {FileAction, FileEntry} from "../models/state";
import {SELECT_FILE} from "./actionTypes";

export function selectFile(file: FileEntry) {
  const action: FileAction = {
    type: SELECT_FILE,
    file,
  }

  return simulateHttpRequest(action)
}

export function simulateHttpRequest(action: any) {
  return (dispatch: any) => {
    setTimeout(() => {
      dispatch(action)
    }, 500)
  }
}
