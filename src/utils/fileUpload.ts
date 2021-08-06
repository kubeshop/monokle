import path from 'path';
import fs from 'fs';

// algorithm to find common root folder for selected files - since the first entry is not
// necessarily the selected folder
// eslint-disable-next-line no-undef
function findRootFolder(files: FileList) {
  let root: any = files[0];
  let topIndex = -1;

  for (let i = 1; i < files.length; i += 1) {
    let rootSegments = root.path.split(path.sep);
    // @ts-ignore
    let fileSegments = files[i].path.split(path.sep);

    let ix = 0;
    while (ix < rootSegments.length && ix < fileSegments.length && rootSegments[ix] === fileSegments[ix]) {
      ix += 1;
    }

    if (topIndex === -1 || ix < topIndex) {
      topIndex = ix;
      root = files[i];
    }
  }

  let result = topIndex !== -1 ? root.path.split(path.sep).slice(0, topIndex).join(path.sep) : root.path;

  // in some cases only a file is returned..
  if (fs.statSync(result).isFile()) {
    result = path.parse(result).dir;
  }

  return result;
}

export function makeOnUploadHandler(folderInputRef: any, setFolder: (folder: any) => {}) {
  return function onUploadHandler(e: React.SyntheticEvent) {
    e.preventDefault();
    if (folderInputRef.current?.files && folderInputRef.current.files.length > 0) {
      setFolder(findRootFolder(folderInputRef.current.files));
    }
  };
}
