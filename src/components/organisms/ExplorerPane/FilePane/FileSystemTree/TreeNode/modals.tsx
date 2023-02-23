import {Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import path from 'path';

import {FileEntry} from '@shared/models/fileEntry';

export function showDeleteEntryModal(entry: FileEntry, onOk: () => void, onCancel: () => void) {
  const title = `Are you sure you want to delete "${path.basename(entry.name)}"?`;

  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    onOk() {
      onOk();
    },
    onCancel() {
      onCancel();
    },
  });
}
