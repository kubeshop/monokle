import React from 'react';

import {Modal} from 'antd';

import {TemplatePluginModule} from '@models/plugin';

import {TemplateFormRenderer} from '@components/molecules';

type TemplateFormModalProps = {isVisible: boolean; template?: TemplatePluginModule; onClose: () => void};

const TemplateFormModal: React.FC<TemplateFormModalProps> = props => {
  const {isVisible, template, onClose} = props;

  if (!template) {
    return null;
  }

  return (
    <Modal visible={isVisible} onCancel={onClose}>
      <TemplateFormRenderer template={template} />
    </Modal>
  );
};

export default TemplateFormModal;
