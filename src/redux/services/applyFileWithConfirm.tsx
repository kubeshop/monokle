import {Modal} from 'antd';
import {ThunkDispatch} from 'redux-thunk';

import {applyFile} from '@redux/thunks/applyFile';

import {FileMapType} from '@models/appstate';

import {ExclamationCircleOutlined} from '@ant-design/icons';

export function applyFileWithConfirm(
  selectedPath: string,
  fileMap: FileMapType,
  dispatch: ThunkDispatch<any, any, any>,
  kubeconfig: string,
  context: string
) {
  const title = `Deploy ${fileMap[selectedPath].name} to cluster [${context}]?`;

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
