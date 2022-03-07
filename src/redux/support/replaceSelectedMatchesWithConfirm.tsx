import {Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import {ThunkDispatch} from 'redux-thunk';

import {replaceSelectedResourceMatches} from '@redux/thunks/replaceSelectedResourceMatches';

export function replaceSelectedMatchesWithConfirm(
  selectedMatchesLength: number,
  context: string,
  dispatch: ThunkDispatch<any, any, any>
) {
  const title = `Replace selected local resources (${selectedMatchesLength}) with cluster resources [${context}]?`;

  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    centered: true,
    onOk() {
      return new Promise(resolve => {
        dispatch(replaceSelectedResourceMatches());
        resolve({});
      });
    },
    onCancel() {},
  });
}
