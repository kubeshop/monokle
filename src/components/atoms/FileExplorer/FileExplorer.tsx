import {ipcRenderer} from 'electron';

import {useEffect} from 'react';
import {useAppSelector} from '@redux/hooks';

import log from 'loglevel';

import {getChannelName} from '@utils/ipc';
import {FileExplorerOptions} from './FileExplorerOptions';

export type FileExplorerProps = {
  isOpen: boolean;
  onSelect: (files: string[]) => void;
  onOpen: () => void;
  options?: FileExplorerOptions;
};

const FileExplorer = (props: FileExplorerProps) => {
  const {isOpen, onSelect, onOpen, options} = props;
  const automation = useAppSelector(state => state.config.automation);

  useEffect(() => {
    if (isOpen) {
      onOpen();

      // @ts-ignore
      if (options?.action === 'save') {
        ipcRenderer.invoke('save-file', options).then(file => {
          if (file) {
            log.info(`Saving file to ${file}`);
            onSelect([file]);
          }
        });
      } else {
        ipcRenderer.invoke(getChannelName('select-file', automation), options).then(files => {
          if (files) {
            onSelect(files);
          }
        });
      }
    }
  }, [isOpen, options, onOpen, onSelect, automation]);

  return null;
};

export default FileExplorer;
