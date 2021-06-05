import fs from 'fs';
import {FileAction, FileDispatchType, FileEntry} from "../models/state";
import {SELECT_ROOT_FOLDER} from "./actionTypes";
import path from "path";

export function setRootFolder(folder: string) {
  const action: FileAction = {
    type: SELECT_ROOT_FOLDER,
    data: {},
  }

  return (dispatch: FileDispatchType) => {
    const folderPath = path.parse(folder)
    action.data = {
      name: folderPath.name,
      folder: folderPath.dir,
      highlight: false,
      selected: false,
      expanded: false,
      children: getAllFiles(folder)
    }

    dispatch(action)
  };
}

const getAllFiles = function (folder: string) {
  const files = fs.readdirSync(folder)
  const result: FileEntry[] = []

  files.forEach(function (file) {
    const fileEntry: FileEntry = {
      name: file,
      folder: folder,
      highlight: false,
      selected: false,
      expanded: false,
      children: []
    }

    if (fs.statSync(folder + "/" + file).isDirectory()) {
      fileEntry.children = getAllFiles(folder + "/" + file)
    }

    result.push(fileEntry)
  })

  return result
}
