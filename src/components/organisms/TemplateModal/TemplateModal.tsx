import React, {useState} from 'react';

import {Button, Input, Modal} from 'antd';

import styled from 'styled-components';

import {AnyTemplate, isReferencedHelmChartTemplate} from '@models/template';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {previewReferencedHelmChart} from '@redux/services/previewReferencedHelmChart';

import {TemplateFormRenderer} from '@components/molecules';

const {TextArea} = Input;

type TemplateModalProps = {isVisible: boolean; template?: AnyTemplate; onClose: () => void};

const StyledTextArea = styled(TextArea)`
  margin-top: 20px;
  ::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }
`;

const TemplateModal: React.FC<TemplateModalProps> = props => {
  const {isVisible, template, onClose} = props;
  const dispatch = useAppDispatch();
  const kubeconfigPath = useAppSelector(state => state.config.kubeconfigPath);
  const kubeconfigContext = useAppSelector(state => state.config.kubeConfig.currentContext);
  const userTempDir = useAppSelector(state => state.config.userTempDir);
  const [formData, setFormData] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>();

  const onClickSubmit = () => {
    if (!isReferencedHelmChartTemplate(template) || !userTempDir || !kubeconfigPath || !kubeconfigContext) {
      return;
    }
    setIsLoading(true);

    previewReferencedHelmChart(
      template.chartName,
      template.chartVersion,
      template.chartRepo,
      template.valuesFilePath,
      [formData],
      kubeconfigPath,
      kubeconfigContext,
      userTempDir,
      dispatch
    )
      .then((notes: string) => {
        setMessage(notes);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setMessage(err.message);
      });
  };

  const close = () => {
    setIsLoading(false);
    setMessage(undefined);
    setFormData(undefined);
    onClose();
  };

  if (!template) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      footer={[
        <Button type="primary" onClick={message ? close : onClickSubmit} loading={isLoading}>
          {message ? 'Done' : 'Submit'}
        </Button>,
      ]}
      onCancel={close}
    >
      {message ? (
        <StyledTextArea rows={16} value={message} readOnly />
      ) : (
        <TemplateFormRenderer formData={formData} onFormDataChange={setFormData} templateForm={template.forms[0]} />
      )}
    </Modal>
  );
};

export default TemplateModal;
