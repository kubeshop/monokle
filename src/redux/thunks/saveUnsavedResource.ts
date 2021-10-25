import path from 'path';
import fs from 'fs';
import util from 'util';
import {createAsyncThunk} from '@reduxjs/toolkit';
import {AppDispatch, RootState} from '@redux/store';
import {isUnsavedResource} from '@redux/services/resource';
import {YAML_DOCUMENT_DELIMITER, ROOT_FILE_ENTRY} from '@constants/constants';
import {AlertEnum, AlertType} from '@models/alert';
import {getFileStats, isSubDirectory} from '@utils/files';
import {getResourcesForPath} from '@redux/services/fileEntry';
import {addResource} from '@redux/reducers/main';
import {createRejectionWithAlert} from './utils';

type SaveUnsavedResourcePayload = {
  resourceId: string;
  resourceFilePath: string;
  resourceRange?: {start: number; length: number};
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
  let resourceRange: {start: number; length: number} | undefined;

  if (!rootFolder) {
    return createRejectionWithAlert(thunkAPI, 'Resource Save Failed', 'Could not find the root folder.');
  }

  if (rootFolder.filePath !== absolutePath && !isSubDirectory(rootFolder.filePath, absolutePath)) {
    return createRejectionWithAlert(
      thunkAPI,
      'Resource Save Failed',
      'The selected path is not a sub-directory of the root directory.'
    );
  }

  if (!resource || !isUnsavedResource(resource)) {
    return createRejectionWithAlert(thunkAPI, 'Resource Save Failed', 'Could not find the resource.');
  }

  const pathStats = getFileStats(absolutePath);
  if (pathStats === undefined) {
    return createRejectionWithAlert(thunkAPI, 'Resource Save Failed', 'Could not load stats for selected path');
  }

  const isDirectory = pathStats.isDirectory();
  let absoluteFilePath = absolutePath;

  /** if the absolute path is a directory, we will use the resource.name to create a new fileName */
  if (isDirectory) {
    const fileName = `${resource.name}-${resource.kind.toLowerCase()}.yaml`;
    absoluteFilePath = path.join(absolutePath, fileName);
  }

  if (path.extname(absoluteFilePath) !== '.yaml') {
    return createRejectionWithAlert(
      thunkAPI,
      'Resource Save Failed',
      'The selected file does not have .yaml extension.'
    );
  }

  if (fs.existsSync(absoluteFilePath)) {
    const rootFileEntry = mainState.fileMap[ROOT_FILE_ENTRY];
    if (!rootFileEntry) {
      return createRejectionWithAlert(thunkAPI, 'Resource Save Failed', 'Could not find the root folder.');
    }

    const fileContent = await readFilePromise(absoluteFilePath, 'utf-8');
    const relativeFilePath = absoluteFilePath.substr(mainState.fileMap[ROOT_FILE_ENTRY].filePath.length);
    const resourcesFromFile = getResourcesForPath(relativeFilePath, mainState.resourceMap);

    if (resourcesFromFile.length === 1) {
      thunkAPI.dispatch(
        addResource({
          ...resourcesFromFile[0],
          range: {
            start: 0,
            length: fileContent.length,
          },
        })
      );
    }

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

    await appendFilePromise(absoluteFilePath, contentToAppend);
  } else {
    await writeFilePromise(absoluteFilePath, resource.text);
  }

  const fileTimestamp = getFileStats(absolutePath)?.mtime.getTime();

  return {
    resourceId,
    resourceFilePath: absoluteFilePath,
    resourceRange,
    fileTimestamp,
    alert: {
      title: 'Resource Saved',
      message: `Saved resource to ${absoluteFilePath}`,
      type: AlertEnum.Success,
    },
  };
});
