import React, {useState} from 'react';
import {Input, Modal} from 'antd';

function PluginInstallModal(props: {isVisible: boolean; onClose: () => void}) {
  const {isVisible, onClose} = props;
  const [pluginUrl, setPluginUrl] = useState<string>();

  return (
    <Modal visible={isVisible} onCancel={onClose}>
      <p>Plugin URL:</p>
      <Input value={pluginUrl} onChange={e => setPluginUrl(e.target.value)} />
    </Modal>
  );
}

export default PluginInstallModal;
