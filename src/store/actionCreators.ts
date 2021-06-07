import fs from 'fs';
import {AppConfig, SetRootFolderAction, SetRootFolderDispatchType, FileEntry, K8sResource} from "../models/state";
import {SET_ROOT_FOLDER} from "./actionTypes";
import path from "path";
import {parseAllDocuments} from "yaml";

export function setRootFolder(folder: string, appConfig: AppConfig) {
  return async (dispatch: SetRootFolderDispatchType) => {
    const folderPath = path.parse(folder)
    const resourceMap : Map<string,K8sResource> = new Map()

    const rootEntry : FileEntry = {
      name: folderPath.name,
      folder: folderPath.dir,
      highlight: false,
      selected: false,
      expanded: false,
      excluded: false,
      children: []
    };

    rootEntry.children = getAllFiles(folder, appConfig, resourceMap, rootEntry);

    const action: SetRootFolderAction = {
      type: SET_ROOT_FOLDER,
      rootFolder: folder,
      appConfig: appConfig,
      resources: [],
      rootEntry: rootEntry,
      resourceMap: resourceMap
    }

    dispatch(action)
  }
}

const getAllFiles = function (folder: string, appConfig: AppConfig, resourceMap: Map<string, K8sResource>, parent : FileEntry ) {
  const files = fs.readdirSync(folder)
  const result: FileEntry[] = []

  files.forEach(function (file) {
    const fileEntry: FileEntry = {
      name: file,
      folder: folder,
      highlight: false,
      selected: false,
      expanded: false,
      excluded: false,
      parent: parent
    }

    if (fs.statSync(folder + "/" + file).isDirectory()) {
      if (appConfig.scanExcludes.includes(file.toLowerCase())) {
        fileEntry.excluded = true
      } else {
        fileEntry.children = getAllFiles(folder + "/" + file, appConfig, resourceMap, fileEntry)
      }
    } else if (appConfig.fileIncludes.some(e => file.toLowerCase().endsWith(e))) {
      extractYamlContent(folder, file, fileEntry, resourceMap);
    }

    result.push(fileEntry)
  })

  return result
}

function createResourceName(content: any) {
  var name = content.metadata?.name ? content.metadata.name + " " : ""
  return name + content.kind + " [" + content.apiVersion + "]"
}

function extractYamlContent(folder: string, file: string, fileEntry: FileEntry, resourceMap: Map<string, K8sResource>) {
  const fileContent = fs.readFileSync(folder + "/" + file, 'utf8')
  const documents = parseAllDocuments(fileContent)

  if (documents) {
    documents.forEach(d => {
      const content = d.toJS();
      if (content && content.apiVersion && content.kind) {
        var resource : K8sResource = {
          folder: folder,
          file: file,
          name: createResourceName( content ),
          id: uuidv4(),
          kind:content.kind,
          version: content.apiVersion,
          content: content,
          highlight: false
        }

        resourceMap.set(resource.id,resource)
        if( !fileEntry.resourceIds ){
          fileEntry.resourceIds = []
        }

        fileEntry.resourceIds.push(resource.id)
      }
    })
  }
}

// taken from https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
