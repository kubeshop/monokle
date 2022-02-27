import {createAsyncThunk} from '@reduxjs/toolkit';

import fs from 'fs';
import micromatch from 'micromatch';
import util from 'util';

import {ROOT_FILE_ENTRY, YAML_DOCUMENT_DELIMITER} from '@constants/constants';

import {AppDispatch} from '@models/appdispatch';
import {FileEntry} from '@models/fileentry';
import {K8sResource} from '@models/k8sresource';
import {RootState} from '@models/rootstate';

import {getFileTimestamp} from '@utils/files';
import {trackEvent} from '@utils/telemetry';

import {createRejectionWithAlert} from './utils';

const ERROR_TITLE = 'Resource Save Failed';

type ResourcePayload = {
  resourceId: string;
  resourceFilePath: string;
  resourceRange?: {start: number; length: number};
  fileTimestamp: number | undefined;
};

type SaveMultipleUnsavedResourcesPayload = {resourcePayloads: ResourcePayload[]};
type SaveMultipleUnsavedResourcesArgs = {
  resourcePayloads: {resource: K8sResource; absolutePath: string}[];
  saveMode: 'saveToFolder' | 'appendToFile';
};

const readFilePromise = util.promisify(fs.readFile);
const appendFilePromise = util.promisify(fs.appendFile);
const writeFilePromise = util.promisify(fs.writeFile);

const performSaveUnsavedResource = async (
  resource: K8sResource,
  rootFolder: FileEntry | undefined,
  absolutePath: string,
  fileIncludes: string[],
  saveMode: 'saveToFolder' | 'appendToFile'
) => {
  let resourceRange: {start: number; length: number} | undefined;
  if (!rootFolder) {
    throw new Error('Could not find the root folder.');
  }

  trackEvent('ADD_NEW_RESOURCE', {resourceKind: resource.kind});

  if (saveMode === 'saveToFolder') {
    await writeFilePromise(absolutePath, resource.text);
  } else {
    const fileName = absolutePath.split('\\').pop();

    if (fileName && !micromatch.isMatch(fileName, fileIncludes)) {
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

export const saveUnsavedResources = createAsyncThunk<
  SaveMultipleUnsavedResourcesPayload,
  SaveMultipleUnsavedResourcesArgs,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/saveUnsavedResources', async (args, thunkAPI) => {
  const mainState = thunkAPI.getState().main;
  const configState = thunkAPI.getState().config;
  const rootFolder = mainState.fileMap[ROOT_FILE_ENTRY];

  let resourcePayloads: ResourcePayload[] = [];

  for (let i = 0; i < args.resourcePayloads.length; i += 1) {
    const {resource, absolutePath} = args.resourcePayloads[i];

    try {
      // eslint-disable-next-line no-await-in-loop
      const {resourceRange, fileTimestamp} = await performSaveUnsavedResource(
        resource,
        rootFolder,
        absolutePath,
        configState.fileIncludes,
        args.saveMode
      );

      resourcePayloads.push({
        resourceId: resource.id,
        resourceFilePath: absolutePath,
        resourceRange,
        fileTimestamp,
      });
    } catch (e) {
      if (e instanceof Error) {
        createRejectionWithAlert(thunkAPI, ERROR_TITLE, e.message);
      }
    }
  }

  return {resourcePayloads};
});
