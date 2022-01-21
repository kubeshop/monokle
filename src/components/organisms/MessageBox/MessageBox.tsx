import {useEffect} from 'react';

import {notification} from 'antd';

import {AlertEnum} from '@models/alert';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {clearAlert} from '@redux/reducers/alert';

const MessageBox = () => {
  const dispatch = useAppDispatch();
  const alert = useAppSelector(state => state.alert.alert);

  useEffect(() => {
    if (alert) {
      let type: any =
        alert.type === AlertEnum.Error
          ? 'error'
          : alert.type === AlertEnum.Warning
          ? 'warning'
          : alert.type === AlertEnum.Success
          ? 'success'
          : 'info';

      // @ts-ignore
      notification[type]({
        message: alert.title,
        description: alert.message,
        duration: type === 'error' ? 5 : alert.duration || 2,
      });

      dispatch(clearAlert());
    }
  }, [alert, dispatch]);

  return null;
};

export default MessageBox;
