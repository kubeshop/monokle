import path from 'path';
import fs from 'fs';
import util from 'util';
import {createAsyncThunk} from '@reduxjs/toolkit';
import {AppDispatch, RootState} from '@redux/store';
import {isUnsavedResource} from '@redux/services/resource';
import {YAML_DOCUMENT_DELIMITER, ROOT_FILE_ENTRY} from '@constants/constants';
import {AlertEnum, AlertType} from '@models/alert';
import {isSubDirectory} from '@utils/files';
import {createPreviewRejection} from './utils';

type SaveUnsavedResourcePayload = {
  resourceId: string;
  resourceFilePath: string;
  fileTimestamp: number;
  alert: AlertType;
};

type SaveUnsavedResourceArgs = {
  resourceId: string;
  absolutePath: string;
};

const readFilePromise = util.promisify(fs.readFile);
const appendFilePromise = util.promisify(fs.appendFile);
const writeFilePromise = util.promisify(fs.writeFile);

export const saveUnsavedResource = createAsyncThunk<
  SaveUnsavedResourcePayload,
  SaveUnsavedResourceArgs,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/saveUnsavedResource', async ({resourceId, absolutePath}, thunkAPI) => {
  const mainState = thunkAPI.getState().main;
  const resource = mainState.resourceMap[resourceId];
  const rootFolder = mainState.fileMap[ROOT_FILE_ENTRY];

  if (!rootFolder) {
    return createPreviewRejection(thunkAPI, 'Resource Save Failed', 'Could not find the root folder.');
  }

  if (rootFolder.filePath !== absolutePath && !isSubDirectory(rootFolder.filePath, absolutePath)) {
    return createPreviewRejection(
      thunkAPI,
      'Resource Save Failed',
      'The selected path is not a sub-directory of the root directory.'
    );
  }

  if (!resource || !isUnsavedResource(resource)) {
    return createPreviewRejection(thunkAPI, 'Resource Save Failed', 'Could not find the resource.');
  }

  const isDirectory = fs.statSync(absolutePath).isDirectory();
  let absoluteFilePath = absolutePath;

  /** if the absolute path is a directory, we will use the resource.name to create a new fileName */
  if (isDirectory) {
    const fileName = `${resource.name}-${resource.kind.toLowerCase()}.yaml`;
    absoluteFilePath = path.join(absolutePath, fileName);
  }

  if (path.extname(absoluteFilePath) !== '.yaml') {
    return createPreviewRejection(thunkAPI, 'Resource Save Failed', 'The selected file does not have .yaml extension.');
  }

  if (fs.existsSync(absoluteFilePath)) {
    const fileContent = await readFilePromise(absoluteFilePath, 'utf-8');
    const contentToAppend =
      fileContent.trim().length === 0 || fileContent.trim().endsWith(YAML_DOCUMENT_DELIMITER)
        ? `${resource.text}`
        : `\n${YAML_DOCUMENT_DELIMITER}${resource.text}`;
    await appendFilePromise(absoluteFilePath, contentToAppend);
  } else {
    await writeFilePromise(absoluteFilePath, resource.text);
  }

  const fileTimestamp = fs.statSync(absolutePath).mtime.getTime();

  return {
    resourceId,
    resourceFilePath: absoluteFilePath,
    fileTimestamp,
    alert: {
      title: 'Resource Saved',
      message: `Saved resource to ${absoluteFilePath}`,
      type: AlertEnum.Success,
    },
  };
});
