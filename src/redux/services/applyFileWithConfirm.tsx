import {Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import {ThunkDispatch} from 'redux-thunk';

import {FileMapType} from '@models/appstate';

import {applyFile} from '@redux/thunks/applyFile';

export function applyFileWithConfirm(
  selectedPath: string,
  fileMap: FileMapType,
  dispatch: ThunkDispatch<any, any, any>,
  kubeconfig: string,
  context: string
) {
  const fileEntry = fileMap[selectedPath];
  if (!fileEntry) {
    return;
  }
  const title = `Deploy ${fileEntry.name} to cluster [${context}]?`;

  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    onOk() {
      return new Promise(resolve => {
        applyFile(selectedPath, fileMap, dispatch, kubeconfig, context);
        resolve({});
      });
    },
    onCancel() {},
  });
}
