import {useEffect, useMemo} from 'react';

import {notification} from 'antd';

import {AlertEnum} from '@models/alert';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {clearAlert} from '@redux/reducers/alert';

import {NotificationMarkdown} from '@molecules';

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

  const modify = (title: string) => {
    const wordsArray = title.split(' ');
    const unauthIndex = wordsArray.indexOf('UNAUTHORIZED');

    if (unauthIndex === -1) {
      return title;
    }

    return `We're sorry, it looks like you're not authorized to connect to this cluster. Please take a look at our [troubleshooting guide for cluster connections in our documentation](https://kubeshop.github.io/monokle/cluster-issues/) for steps on how to resolve this issue.\n\n
      
    Error:\n
    ${title}`;
  };

  useEffect(() => {
    if (!alert) {
      return;
    }

    if (!alert.silent) {
      // @ts-ignore
      notification[notificationType]({
        key: alert.id,
        message: modify(alert.title),
        description: <NotificationMarkdown notification={alert} type={notificationType} />,
        duration: alert.duration || 4,
      });
    }

    dispatch(clearAlert());
  }, [alert, dispatch, notificationType]);

  return null;
};

export default MessageBox;
