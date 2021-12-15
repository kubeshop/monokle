import {ipcRenderer} from 'electron';

import React, {useState} from 'react';

import {Button, Input, Modal} from 'antd';

import {DOWNLOAD_PLUGIN, DOWNLOAD_PLUGIN_RESULT} from '@constants/ipcEvents';

import {MonoklePlugin} from '@models/plugin';

import {useAppDispatch} from '@redux/hooks';
import {addPlugin} from '@redux/reducers/contrib';

const downloadPlugin = (pluginUrl: string) => {
  return new Promise<MonoklePlugin>((resolve, reject) => {
    const downloadPluginResult = (_: any, result: any) => {
      if (result instanceof Error) {
        reject(result);
      }
      resolve(result as MonoklePlugin);
    };
    ipcRenderer.once(DOWNLOAD_PLUGIN_RESULT, downloadPluginResult);
    ipcRenderer.send(DOWNLOAD_PLUGIN, pluginUrl);
  });
};

function PluginInstallModal(props: {isVisible: boolean; onClose: () => void}) {
  const dispatch = useAppDispatch();
  const {isVisible, onClose} = props;
  const [pluginUrl, setPluginUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const onClickDownload = async () => {
    try {
      setIsDownloading(true);
      const plugin = await downloadPlugin(pluginUrl);
      dispatch(addPlugin(plugin));
      close();
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      }
    }
    setIsDownloading(false);
  };

  const close = () => {
    setPluginUrl('');
    setIsDownloading(false);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      footer={[
        <Button key="back" onClick={close}>
          Close
        </Button>,
        <Button key="submit" type="primary" loading={isDownloading} onClick={onClickDownload}>
          Download plugin
        </Button>,
      ]}
      onCancel={close}
    >
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
