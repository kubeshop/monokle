import {replaceInFile} from 'replace-in-file';

import {AppDispatch} from '@models/appdispatch';

import {getRelativeFilePath} from '@redux/services/fileEntry';
import {updateFileEntries} from '@redux/thunks/updateFileEntry';

export async function replaceInFiles(files: string[], query: RegExp, replaceQuery: string, dispatch: AppDispatch) {
  const options = {
    files,
    from: query,
    to: replaceQuery,
  };
  try {
    const results = await replaceInFile(options);
    console.log('Replacement results:', results);
    const pathes = results.map(result => {
      // const content = fs.readFileSync(result.file, 'utf8');
      return {
        relativePath: getRelativeFilePath(result.file),
        absolutePath: result.file,
      };
    });
    dispatch(updateFileEntries({pathes}));
  } catch (error) {
    console.error('Error occurred:', error);
  }
}
