import {ipcRenderer} from 'electron';

import {useCallback, useEffect} from 'react';

import log from 'loglevel';

import {useAppDispatch} from '@redux/hooks';
import {setRootFolder} from '@redux/thunks/setRootFolder';

export function useSetFolderFromMainThread() {
  const dispatch = useAppDispatch();
  const setFolder = useCallback(
    (folder: string) => {
      dispatch(setRootFolder(folder));
    },
    [dispatch]
  );

  const onSelectRootFolderFromMainThread = useCallback(
    (_: any, data: string) => {
      if (data) {
        log.info('setting root folder from main thread', data);
        setFolder(data);
      }
    },
    [setFolder]
  );

  // called from main thread because thunks cannot be dispatched by main
  useEffect(() => {
    ipcRenderer.on('set-root-folder', onSelectRootFolderFromMainThread);
    return () => {
      ipcRenderer.removeListener('set-root-folder', onSelectRootFolderFromMainThread);
    };
  }, [onSelectRootFolderFromMainThread]);
}
