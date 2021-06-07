import fs from 'fs';
import {AppConfig, SetRootFolderAction, SetRootFolderDispatchType, FileEntry} from "../models/state";
import {SET_ROOT_FOLDER} from "./actionTypes";
import path from "path";

export function setRootFolder(folder: string, appConfig: AppConfig) {
  const action: SetRootFolderAction = {
    type: SET_ROOT_FOLDER,
    rootFolder: folder,
    appConfig: appConfig,
  }

  return indexRootFolder(action)
}

const indexRootFolder = function (action: SetRootFolderAction) {
  return (dispatch: SetRootFolderDispatchType) => {
    const folderPath = path.parse(action.rootFolder)
    action.rootEntry = {
      name: folderPath.name,
      folder: folderPath.dir,
      highlight: false,
      selected: false,
      expanded: false,
      excluded: false,
      children: getAllFiles(action.rootFolder, action.appConfig)
    }

    dispatch(action)
  }
}

const getAllFiles = function (folder: string, appConfig: AppConfig) {
  console.log( "getting all files in folder " + folder )
  const files = fs.readdirSync(folder)
  const result: FileEntry[] = []

  files.forEach(function (file) {
    console.log( "found file "+ file )
    const fileEntry: FileEntry = {
      name: file,
      folder: folder,
      highlight: false,
      selected: false,
      expanded: false,
      excluded: false,
      children: []
    }

    if (fs.statSync(folder + "/" + file).isDirectory()) {
      if (appConfig.scanExcludes.includes(file)) {
        fileEntry.excluded = true
      } else {
        fileEntry.children = getAllFiles(folder + "/" + file, appConfig)
      }
    }

    result.push(fileEntry)
  })

  return result
}
