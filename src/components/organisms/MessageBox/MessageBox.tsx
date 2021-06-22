import * as React from 'react';
import { Alert } from 'react-bootstrap';

import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { clearAlert } from '@redux/reducers/alert';
import { AlertEnum } from '@models/alert';

const MessageBox = () => {
  const dispatch = useAppDispatch();
  const alert = useAppSelector(state => state.alert.alert);

  const clear = () => {
    dispatch(clearAlert());
  };

  let alertVariant = 'success';
  if (alert && alert.type === AlertEnum.Error) {
    alertVariant = 'warning';
  }

  return (<>
      {alert &&
      <Alert variant={alertVariant} onClose={clear} dismissible>
        <Alert.Heading>{alert.title}</Alert.Heading>
        <p>{alert.message}</p>
      </Alert>
      }
    </>
  );
};

export default MessageBox;
