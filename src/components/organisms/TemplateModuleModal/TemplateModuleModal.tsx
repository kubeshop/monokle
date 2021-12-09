import React from 'react';

import {Modal} from 'antd';

const TemplateFormModal: React.FC<{isVisible: boolean; onClose: () => void}> = props => {
  const {isVisible, onClose} = props;
  return (
    <Modal visible={isVisible} onCancel={onClose}>
      <p>This should render the template form</p>
    </Modal>
  );
};

export default TemplateFormModal;
