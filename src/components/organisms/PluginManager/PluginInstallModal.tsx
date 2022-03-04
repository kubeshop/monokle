import {ipcRenderer, shell} from 'electron';

import React, {useEffect, useState} from 'react';

import {Button, Form, Input, Modal} from 'antd';
import {useForm} from 'antd/lib/form/Form';

import gitUrlParse from 'git-url-parse';

import {PLUGIN_DOCS_URL} from '@constants/constants';
import {DOWNLOAD_PLUGIN, DOWNLOAD_PLUGIN_RESULT} from '@constants/ipcEvents';

import {DownloadPluginResult, isDownloadPluginResult} from '@models/extension';

import {useAppDispatch} from '@redux/hooks';
import {addMultipleTemplates, addPlugin} from '@redux/reducers/extension';

import {useFocus} from '@utils/hooks';

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
  const [formValues, setFormValues] = useState({pluginUrl: ''});
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [pluginForm] = useForm();
  const [inputRef, focus] = useFocus<any>();

  const download = async (pluginUrl: string) => {
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
    pluginForm.setFields([
      {
        name: 'pluginUrl',
        value: '',
        errors: [],
      },
    ]);
    setIsDownloading(false);
    onClose();
  };

  const handlePluginURLChange = async (url: string) => {
    try {
      const parsedURL = gitUrlParse(url);
      if (!parsedURL.owner || !parsedURL.name) {
        setErrorMessage('Please enter a valid git URL!');
        return;
      }
      if (!parsedURL.protocols.includes('https')) {
        setErrorMessage('Currently we support only HTTPS protocol');
        return;
      }
      await download(`${parsedURL.protocol}://${parsedURL.resource}/${parsedURL.owner}/${parsedURL.name}`);
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  const onFinish = async (values: {pluginUrl: string}) => {
    setFormValues(values);
    await handlePluginURLChange(values.pluginUrl);
  };

  useEffect(() => {
    if (isVisible) {
      focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  useEffect(() => {
    pluginForm.setFields([
      {
        name: 'pluginUrl',
        value: formValues.pluginUrl,
        errors: errorMessage ? [errorMessage] : [],
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorMessage]);

  return (
    <Modal
      visible={isVisible}
      footer={[
        <Button key="back" onClick={close}>
          Close
        </Button>,
        <Button key="submit" type="primary" loading={isDownloading} onClick={() => pluginForm.submit()}>
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
      <Form layout="vertical" form={pluginForm} onFinish={onFinish} initialValues={() => formValues}>
        <Form.Item
          name="pluginUrl"
          label="URL"
          required
          tooltip="pluginUrl"
          rules={[
            {
              required: true,
              message: 'Please provide your plugin URL!',
            },
          ]}
        >
          <Input ref={inputRef} placeholder="Enter Plugin URL" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default PluginInstallModal;
