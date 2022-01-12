import {useEffect} from 'react';

import {Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {extendResourceFilter, uncheckAllResourceIds} from '@redux/reducers/main';

const ChangeFiltersConfirmModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const filtersToBeChanged = useAppSelector(state => state.main.filtersToBeChanged);

  useEffect(() => {
    if (filtersToBeChanged) {
      Modal.confirm({
        title: 'I understand that changing the filters will uncheck all my selected resources.',
        icon: <ExclamationCircleOutlined />,
        onOk() {
          return new Promise(resolve => {
            dispatch(uncheckAllResourceIds());
            dispatch(extendResourceFilter(filtersToBeChanged));
            resolve({});
          });
        },
        onCancel() {},
      });
    }
  }, [dispatch, filtersToBeChanged]);

  return null;
};

export default ChangeFiltersConfirmModal;
