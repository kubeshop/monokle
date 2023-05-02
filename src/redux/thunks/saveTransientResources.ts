import {createAsyncThunk} from '@reduxjs/toolkit';

import fs from 'fs';
import util from 'util';

import {YAML_DOCUMENT_DELIMITER} from '@constants/constants';

import {fileIsExcluded} from '@redux/services/fileEntry';

import {getFileTimestamp, hasValidExtension} from '@utils/files';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {AppDispatch} from '@shared/models/appDispatch';
import {FileEntry} from '@shared/models/fileEntry';
import {K8sResource} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';
import {trackEvent} from '@shared/utils/telemetry';

import {createRejectionWithAlert} from './utils';

const ERROR_TITLE = 'Resource Save Failed';

type ResourcePayload = {
  resourceId: string;
  resourceFilePath: string;
  resourceRange?: {start: number; length: number};
  fileTimestamp: number | undefined;
  isExcluded: boolean;
};

type SaveMultipleTransientResourcesPayload = {resourcePayloads: ResourcePayload[]};
type SaveMultipleTransientResourcesArgs = {
  resourcePayloads: {resource: K8sResource; absolutePath: string}[];
  saveMode: 'saveToFolder' | 'appendToFile';
};

const readFilePromise = util.promisify(fs.readFile);
const appendFilePromise = util.promisify(fs.appendFile);
const writeFilePromise = util.promisify(fs.writeFile);

const performSaveTransientResource = async (
  resource: K8sResource,
  rootFolder: FileEntry | undefined,
  absolutePath: string,
  saveMode: 'saveToFolder' | 'appendToFile'
) => {
  let resourceRange: {start: number; length: number} | undefined;
  if (!rootFolder) {
    throw new Error('Could not find the root folder.');
  }

  trackEvent('create/resource', {resourceKind: resource.kind});

  if (saveMode === 'saveToFolder') {
    await writeFilePromise(absolutePath, resource.text);
  } else {
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
};

export const saveTransientResources = createAsyncThunk<
  SaveMultipleTransientResourcesPayload,
  SaveMultipleTransientResourcesArgs,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/saveTransientResources', async (args, thunkAPI) => {
  const mainState = thunkAPI.getState().main;
  const rootFolder = mainState.fileMap[ROOT_FILE_ENTRY];

  let resourcePayloads: ResourcePayload[] = [];

  for (let i = 0; i < args.resourcePayloads.length; i += 1) {
    const {resource, absolutePath} = args.resourcePayloads[i];

    try {
      // eslint-disable-next-line no-await-in-loop
      const {resourceRange, fileTimestamp} = await performSaveTransientResource(
        resource,
        rootFolder,
        absolutePath,
        args.saveMode
      );

      resourcePayloads.push({
        resourceId: resource.id,
        resourceFilePath: absolutePath,
        resourceRange,
        fileTimestamp,
        isExcluded: Boolean(fileIsExcluded(absolutePath, thunkAPI.getState().config.projectConfig || {})),
      });
    } catch (e) {
      if (e instanceof Error) {
        return createRejectionWithAlert(thunkAPI, ERROR_TITLE, e.message);
      }
    }
  }

  return {resourcePayloads};
});
