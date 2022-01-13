import {ipcRenderer} from 'electron';

import React, {useState} from 'react';

import {Button, Input, Modal, Radio} from 'antd';

import {
  DOWNLOAD_TEMPLATE,
  DOWNLOAD_TEMPLATE_PACK,
  DOWNLOAD_TEMPLATE_PACK_RESULT,
  DOWNLOAD_TEMPLATE_RESULT,
} from '@constants/ipcEvents';

import {AnyTemplate, TemplatePack, isAnyTemplate, isTemplatePack} from '@models/template';

import {useAppDispatch} from '@redux/hooks';
import {addMultipleTemplates, addTemplate, addTemplatePack} from '@redux/reducers/contrib';

const downloadTemplate = (templateUrl: string) => {
  return new Promise<{template: AnyTemplate}>((resolve, reject) => {
    const downloadTemplateResult = (_: any, result: any) => {
      if (result instanceof Error) {
        reject(result);
      }
      if (!isAnyTemplate(result.template)) {
        reject(new Error(`Failed Template installation.`));
      }
      resolve(result);
    };
    ipcRenderer.once(DOWNLOAD_TEMPLATE_RESULT, downloadTemplateResult);
    ipcRenderer.send(DOWNLOAD_TEMPLATE, templateUrl);
  });
};

const downloadTemplatePack = (templatePackUrl: string) => {
  return new Promise<{templatePack: TemplatePack; templates: AnyTemplate[]}>((resolve, reject) => {
    const downloadTemplatePackResult = (_: any, result: any) => {
      if (result instanceof Error) {
        reject(result);
      }
      if (!isTemplatePack(result.templatePack)) {
        reject(new Error(`Failed Template Pack installation.`));
      }
      resolve(result);
    };
    ipcRenderer.once(DOWNLOAD_TEMPLATE_PACK_RESULT, downloadTemplatePackResult);
    ipcRenderer.send(DOWNLOAD_TEMPLATE_PACK, templatePackUrl);
  });
};

function TemplateInstallModal(props: {isVisible: boolean; onClose: () => void}) {
  const dispatch = useAppDispatch();
  const {isVisible, onClose} = props;
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'template' | 'template-pack'>('template');
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const onClickDownload = async () => {
    try {
      setIsDownloading(true);

      if (selectedType === 'template') {
        const {template} = await downloadTemplate(downloadUrl);
        dispatch(addTemplate(template));
      } else if (selectedType === 'template-pack') {
        const {templatePack, templates} = await downloadTemplatePack(downloadUrl);
        dispatch(addTemplatePack(templatePack));
        dispatch(addMultipleTemplates(templates));
      }
      close();
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      }
    }
    setIsDownloading(false);
  };

  const close = () => {
    setDownloadUrl('');
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
          Download template {selectedType === 'template-pack' && 'pack'}
        </Button>,
      ]}
      onCancel={close}
    >
      <Radio.Group value={selectedType} onChange={e => setSelectedType(e.target.value)}>
        <Radio value="template">Template</Radio>
        <Radio value="template-pack">Template Pack</Radio>
      </Radio.Group>
      {selectedType === 'template' ? <p>Template URL:</p> : <p>Template Pack URL:</p>}
      <Input defaultValue={downloadUrl} onChange={e => setDownloadUrl(e.target.value)} />
      {errorMessage && (
        <div>
          <p>{errorMessage}</p>
        </div>
      )}
    </Modal>
  );
}

export default TemplateInstallModal;
