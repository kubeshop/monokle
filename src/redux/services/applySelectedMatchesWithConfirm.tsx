import {Modal} from 'antd';
import {ThunkDispatch} from 'redux-thunk';

import {applySelectedResourceMatches} from '@redux/thunks/applySelectedResourceMatches';

import {ExclamationCircleOutlined} from '@ant-design/icons';

export function applySelectedMatchesWithConfirm(
  selectedMatchesLength: number,
  context: string,
  dispatch: ThunkDispatch<any, any, any>
) {
  const title = `Deploy selected resources (${selectedMatchesLength}) to cluster [${context}]?`;

  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    centered: true,
    onOk() {
      return new Promise(resolve => {
        dispatch(applySelectedResourceMatches());
        resolve({});
      });
    },
    onCancel() {},
  });
}
