import {createAsyncThunk} from '@reduxjs/toolkit';

import fs from 'fs';
import path from 'path';
import util from 'util';

import {ROOT_FILE_ENTRY, YAML_DOCUMENT_DELIMITER} from '@constants/constants';

import {AlertEnum, AlertType} from '@models/alert';
import {K8sResource} from '@models/k8sresource';

import {addResource} from '@redux/reducers/main';
import {getResourcesForPath} from '@redux/services/fileEntry';
import {AppDispatch, RootState} from '@redux/store';

import {getFileStats, getFileTimestamp, isSubDirectory} from '@utils/files';

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
  newResource?: K8sResource;
  isNewResourceProvided?: boolean;
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
>('main/saveUnsavedResource', async ({resourceId, absolutePath, newResource, isNewResourceProvided}, thunkAPI) => {
  const mainState = thunkAPI.getState().main;
  const resource = isNewResourceProvided ? newResource : mainState.resourceMap[resourceId];
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

  if (!resource) {
    return createRejectionWithAlert(thunkAPI, 'Resource Save Failed', 'Could not find the resource.');
  }

  const pathStats = getFileStats(absolutePath);

  // new file?
  if (pathStats === undefined) {
    await writeFilePromise(absolutePath, resource.text);
  } else {
    const isDirectory = pathStats.isDirectory();

    /** if the absolute path is a directory, we will use the resource.name to create a new fileName */
    if (isDirectory) {
      const fileName = `${resource.name}-${resource.kind.toLowerCase()}.yaml`;
      absolutePath = path.join(absolutePath, fileName);
    }

    if (path.extname(absolutePath) !== '.yaml') {
      return createRejectionWithAlert(
        thunkAPI,
        'Resource Save Failed',
        'The selected file does not have .yaml extension.'
      );
    }

    if (fs.existsSync(absolutePath)) {
      const rootFileEntry = mainState.fileMap[ROOT_FILE_ENTRY];
      if (!rootFileEntry) {
        return createRejectionWithAlert(thunkAPI, 'Resource Save Failed', 'Could not find the root folder.');
      }

      const fileContent = await readFilePromise(absolutePath, 'utf-8');
      const relativeFilePath = absolutePath.substr(mainState.fileMap[ROOT_FILE_ENTRY].filePath.length);
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

      await appendFilePromise(absolutePath, contentToAppend);
    }
  }

  const fileTimestamp = getFileTimestamp(absolutePath);

  return {
    resourceId,
    resourceFilePath: absolutePath,
    resourceRange,
    fileTimestamp,
    alert: {
      title: 'Resource Saved',
      message: `Saved resource to ${absolutePath}`,
      type: AlertEnum.Success,
    },
  };
});
