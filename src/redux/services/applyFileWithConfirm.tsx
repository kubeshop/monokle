import {FileMapType} from '@models/appstate';
import {applyFile} from '@redux/thunks/applyFile';
import {ThunkDispatch} from 'redux-thunk';
import {Modal} from 'antd';
import {ExclamationCircleOutlined} from '@ant-design/icons';

export function applyFileWithConfirm(
  selectedPath: string,
  fileMap: FileMapType,
  dispatch: ThunkDispatch<any, any, any>,
  kubeconfig: string
) {
  const title = `Deploy ${fileMap[selectedPath].name} to your cluster?`;

  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    onOk() {
      return new Promise(resolve => {
        applyFile(selectedPath, fileMap, dispatch, kubeconfig);
        resolve({});
      });
    },
    onCancel() {},
  });
}
