import {ipcRenderer} from 'electron';

import React, {useState} from 'react';

import {Input, Modal} from 'antd';

import {DOWNLOAD_PLUGIN, DOWNLOAD_PLUGIN_RESULT} from '@constants/ipcEvents';

const downloadPlugin = (pluginUrl: string) => {
  return new Promise<void>((resolve, reject) => {
    const downloadPluginResult = (event: Electron.IpcRendererEvent, result: any) => {
      if (result instanceof Error) {
        reject(result);
      }
      resolve();
    };
    ipcRenderer.once(DOWNLOAD_PLUGIN_RESULT, downloadPluginResult);
    ipcRenderer.send(DOWNLOAD_PLUGIN, pluginUrl);
  });
};

function PluginInstallModal(props: {isVisible: boolean; onClose: () => void}) {
  const {isVisible, onClose} = props;
  const [pluginUrl, setPluginUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>();

  const handleOk = async () => {
    try {
      await downloadPlugin(pluginUrl);
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      }
    }
  };

  return (
    <Modal visible={isVisible} onCancel={onClose} onOk={handleOk}>
      <p>Plugin URL:</p>
      <Input defaultValue={pluginUrl} onChange={e => setPluginUrl(e.target.value)} />
      {errorMessage && (
        <div>
          <p>{errorMessage}</p>
        </div>
      )}
    </Modal>
  );
}

export default PluginInstallModal;
