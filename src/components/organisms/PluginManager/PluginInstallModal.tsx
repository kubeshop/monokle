import {ipcRenderer, shell} from 'electron';

import React, {useState} from 'react';

import {Button, Input, Modal} from 'antd';

import {PLUGIN_DOCS_URL} from '@constants/constants';
import {DOWNLOAD_PLUGIN, DOWNLOAD_PLUGIN_RESULT} from '@constants/ipcEvents';

import {DownloadPluginResult, isDownloadPluginResult} from '@models/extension';

import {useAppDispatch} from '@redux/hooks';
import {addMultipleTemplates, addPlugin} from '@redux/reducers/extension';

import Colors from '@styles/Colors';

const downloadPlugin = (pluginUrl: string) => {
  return new Promise<DownloadPluginResult>((resolve, reject) => {
    const downloadPluginResult = (_: any, result: DownloadPluginResult | Error) => {
      if (result instanceof Error) {
        reject(result);
        return;
      }
      if (!isDownloadPluginResult(result)) {
        reject(new Error(`Failed Plugin installation.`));
        return;
      }
      resolve(result);
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
      const downloadPluginResult = await downloadPlugin(pluginUrl);
      const {pluginExtension, templateExtensions} = downloadPluginResult;
      dispatch(addPlugin(pluginExtension));
      dispatch(addMultipleTemplates(templateExtensions));
      close();
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      }
    }
    setIsDownloading(false);
  };

  const onClickOpenDocs = () => {
    shell.openExternal(PLUGIN_DOCS_URL);
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
          Download and install plugin
        </Button>,
      ]}
      onCancel={close}
    >
      <h2>Plugin Installation</h2>
      <p style={{color: Colors.grey7}}>To install a Plugin, please enter a valid GitHub repository URL below.</p>
      <p>
        <Button type="link" onClick={onClickOpenDocs} style={{padding: 0}}>
          See Plugin&apos;s documentation for more information.
        </Button>
      </p>
      <Input placeholder="Enter Plugin URL" defaultValue={pluginUrl} onChange={e => setPluginUrl(e.target.value)} />
      {errorMessage && (
        <div>
          <p>{errorMessage}</p>
        </div>
      )}
    </Modal>
  );
}

export default PluginInstallModal;
