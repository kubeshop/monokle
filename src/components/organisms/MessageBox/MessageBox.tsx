import * as React from 'react';
import {Alert} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {clearAlert} from '@redux/reducers/alert';
import {AlertEnum} from '@models/alert';

const MessageBox = () => {
  const dispatch = useAppDispatch();
  const alert = useAppSelector(state => state.alert.alert);

  const clear = () => {
    dispatch(clearAlert());
  };

  let alertVariant: ("success" | "info" | "warning" | "error" | undefined) = 'success';
  if (alert && alert.type === AlertEnum.Error) {
    alertVariant = 'warning';
  }

  return (
    <>
      {alert && (
        <Alert
          type={alertVariant}
          message={alert.title}
          description={alert.message}
          onClose={clear}
          closable
        />
      )}
    </>
  );
};

export default MessageBox;
