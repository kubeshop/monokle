import {useCallback, useEffect} from 'react';

import {AlertEnum} from '@models/alert';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {seenNotifications} from '@redux/reducers/main';

import {sleep} from '@utils/sleep';

import Notification from './Notification';

import * as S from './styled';

const NotificationsManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const isNotificationsOpen = Boolean(useAppSelector(state => state.ui.isNotificationsOpen));
  const notifications = useAppSelector(state => state.main.notifications);

  const getNotificationBadge = useCallback(
    (type: AlertEnum) => {
      if (type === AlertEnum.Success) {
        return <S.CheckCircleOutlined />;
      }
      if (type === AlertEnum.Warning) {
        return <S.ExclamationCircleOutlinedWarning />;
      }
      if (type === AlertEnum.Error) {
        return <S.ExclamationCircleOutlined />;
      }
      return <S.InfoCircleOutlined />;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notifications]
  );

  useEffect(() => {
    async function markNotificationsSeen() {
      if (isNotificationsOpen) {
        // await for 1 sec before changing background color of notifications
        await sleep(1000);
        dispatch(seenNotifications());
      }
    }

    markNotificationsSeen();
  }, [isNotificationsOpen, dispatch]);

  return (
    <>
      {notifications && notifications.length > 0 ? (
        notifications.map(notification => {
          return (
            <Notification
              key={notification.id}
              notification={notification}
              badge={getNotificationBadge(notification.type)}
            />
          );
        })
      ) : (
        <S.NoNotificationsContainer>You don&apos;t have any notifications.</S.NoNotificationsContainer>
      )}
    </>
  );
};

export default NotificationsManager;
