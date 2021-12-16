import {Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import {ThunkDispatch} from 'redux-thunk';

import {applyCheckedResources} from '@redux/thunks/applyCheckedResources';

const applyCheckedResourcesWithConfirm = (
  checkedResourcesLength: number,
  context: string,
  dispatch: ThunkDispatch<any, any, any>
) => {
  const title = `Deploy selected resources (${checkedResourcesLength}) to cluster [${context}]?`;

  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    centered: true,
    onOk() {
      return new Promise(resolve => {
        dispatch(applyCheckedResources());
        resolve({});
      });
    },
    onCancel() {},
  });
};

export default applyCheckedResourcesWithConfirm;
