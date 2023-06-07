import {useEffect, useMemo} from 'react';
import {Provider} from 'react-redux';

import {notification} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {clearAlert} from '@redux/reducers/alert';
import store from '@redux/store';

import {NotificationMarkdown} from '@molecules';

import {enhanceErrorMessage} from '@utils/notification';

import {AlertEnum} from '@shared/models/alert';

const MessageBox: React.FC = () => {
  const dispatch = useAppDispatch();
  const alert = useAppSelector(state => state.alert.alert);

  const notificationType = useMemo(
    () =>
      !alert
        ? ''
        : alert.type === AlertEnum.Error
        ? 'error'
        : alert.type === AlertEnum.Warning
        ? 'warning'
        : alert.type === AlertEnum.Success
        ? 'success'
        : 'info',
    [alert]
  );

  useEffect(() => {
    if (!alert) {
      return;
    }

    if (!alert.silent) {
      // @ts-ignore
      notification[notificationType]({
        key: alert.id,
        message: alert.title,
        description: (
          <Provider store={store}>
            <NotificationMarkdown
              notification={{...alert, message: enhanceErrorMessage(alert.message)}}
              type={notificationType}
            />
          </Provider>
        ),
        duration: alert.duration || 4,
        style: {zIndex: '10000'},
        icon: alert.icon,
      });
    }

    dispatch(clearAlert());
  }, [alert, dispatch, notificationType]);

  return null;
};

export default MessageBox;
