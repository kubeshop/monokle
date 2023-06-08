import {createAsyncThunk} from '@reduxjs/toolkit';

import fs from 'fs';
import util from 'util';

import {YAML_DOCUMENT_DELIMITER} from '@constants/constants';

import {getFileTimestamp, hasValidExtension} from '@utils/files';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {AppDispatch} from '@shared/models/appDispatch';
import {K8sResource} from '@shared/models/k8sResource';
import {ResourceSavingDestination} from '@shared/models/resourceCreate';
import {RootState} from '@shared/models/rootState';

const readFilePromise = util.promisify(fs.readFile);
const appendFilePromise = util.promisify(fs.appendFile);
const writeFilePromise = util.promisify(fs.writeFile);

export type SaveResourceToFileFolderPayload = {
  resourceRange: {start: number; length: number} | undefined;
  fileTimestamp: number | undefined;
};
type SaveResourceToFileFolderArgs = {
  resource: K8sResource;
  absolutePath: string;
  saveMode: ResourceSavingDestination;
};

export const saveResourceToFileFolder = createAsyncThunk<
  SaveResourceToFileFolderPayload,
  SaveResourceToFileFolderArgs,
  {dispatch: AppDispatch; state: RootState}
>('main/saveResourceToFileFolder', async (payload, thunkAPI) => {
  const mainState = thunkAPI.getState().main;
  const rootFolder = mainState.fileMap[ROOT_FILE_ENTRY];

  const {absolutePath, resource, saveMode} = payload;

  let resourceRange: {start: number; length: number} | undefined;

  if (!rootFolder) {
    throw new Error('Could not find the root folder.');
  }

  if (saveMode === 'saveToFolder') {
    await writeFilePromise(absolutePath, resource.text);
  } else if (saveMode === 'appendToFile') {
    const fileName = absolutePath.split('\\').pop();

    if (!hasValidExtension(fileName, ['.yaml', '.yml'])) {
      throw new Error('The selected file does not have .yaml extension.');
    }

    const fileContent = await readFilePromise(absolutePath, 'utf-8');
    let contentToAppend = resource.text;
    if (fileContent.trim().length > 0) {
      if (fileContent.trim().endsWith(YAML_DOCUMENT_DELIMITER)) {
        contentToAppend = `\n${resource.text}`;
      } else {
        contentToAppend = `\n${YAML_DOCUMENT_DELIMITER}\n${resource.text}`;
      }
    }

    resourceRange = {
      start: fileContent.length,
      length: contentToAppend.length,
    };

    await appendFilePromise(absolutePath, contentToAppend);
  }
  const fileTimestamp = getFileTimestamp(absolutePath);

  return {resourceRange, fileTimestamp};
});
