import {FSWatcher, watch} from 'chokidar';
import {readFileSync} from 'fs';

// import {AppDispatch} from '@redux/store';

let watcher: FSWatcher;

/**
 * Creates a monitor for the specified folder and dispatches folder events using the specified dispatch
 */

export function monitorProjectConfigFile(filePath?: string | null) {
  if (watcher || !filePath) {
    watcher.close();
    return;
  }

  const absolutePath = `${filePath}/.monokle`;

  watcher = watch(absolutePath, {
    persistent: true,
    usePolling: true,
    interval: 1000,
  });

  watcher
    .on('add', () => {
      readConfigFileAndUpdateProjectSettings(absolutePath);
    })
    .on('change', () => {
      readConfigFileAndUpdateProjectSettings(absolutePath);
    })
    .on('unlink', () => {
      readConfigFileAndUpdateProjectSettings(absolutePath);
    });

  watcher
    /* eslint-disable no-console */
    .on('error', error => console.log(`Watcher error: ${error}`));
}

const readConfigFileAndUpdateProjectSettings = (absolutePath: string) => {
  const fileContent: any = JSON.parse(readFileSync(absolutePath, 'utf8'));
  console.log(fileContent);
};
