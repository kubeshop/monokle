import {useEffect} from 'react';

import {notification} from 'antd';

import _ from 'lodash';

import {AlertEnum} from '@models/alert';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {clearAlert} from '@redux/reducers/alert';

import NotificationMarkdown from '@components/molecules/NotificationMarkdown';

const MessageBox: React.FC = () => {
  const dispatch = useAppDispatch();
  const alert = useAppSelector(state => state.alert.alert);

  useEffect(() => {
    if (!alert) {
      return;
    }

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
      key: alert.id,
      message: alert.title,
      description: (
        <NotificationMarkdown
          message={_.truncate(alert.message, {length: 200})}
          extraContentType={alert.extraContentType}
          notificationId={alert.id}
        />
      ),
      duration: alert.duration || 2,
    });

    dispatch(clearAlert());
  }, [alert, dispatch]);

  return null;
};

export default MessageBox;
