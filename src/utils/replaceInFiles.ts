import log from 'loglevel';
import {replaceInFile} from 'replace-in-file';

import {getRelativeFilePath} from '@redux/services/fileEntry';
import {updateFileEntries} from '@redux/thunks/updateFileEntry';

import {AppDispatch} from '@shared/models/appDispatch';

export async function replaceInFiles(files: string[], query: RegExp, replaceQuery: string, dispatch: AppDispatch) {
  const options = {
    files,
    from: query,
    to: replaceQuery,
  };
  try {
    const results = await replaceInFile(options);
    const pathes = results.map(result => {
      return {
        relativePath: getRelativeFilePath(result.file),
        absolutePath: result.file,
      };
    });
    dispatch(updateFileEntries({pathes}));
  } catch (error) {
    log.error('Error occurred:', error);
  }
}
