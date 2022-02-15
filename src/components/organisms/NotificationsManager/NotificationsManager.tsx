import {useCallback, useEffect} from 'react';

import {Tooltip} from 'antd';

import {DateTime} from 'luxon';

import {AlertEnum} from '@models/alert';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {seenNotifications} from '@redux/reducers/main';

import NotificationMarkdown from '@molecules/NotificationMarkdown';

import {useCopyToClipboard} from '@hooks/useCopyToClipboard';

import * as S from './styled';

type NotificationProps = {
  notification: any;
  badge: JSX.Element;
};

const Notification: React.FC<NotificationProps> = props => {
  const {notification, badge} = props;
  const {createdAt, title, message} = notification;

  const copyToClipboardMessage = `Title: ${title}. Description: ${message}.`;

  const {isCopied, setCopyToClipboardState} = useCopyToClipboard(copyToClipboardMessage);

  const onCopyToClipboard = () => {
    if (isCopied) {
      return;
    }

    setCopyToClipboardState(true);
  };

  return (
    <S.StyledDiv key={notification.id}>
      <S.DateSpan>
        {DateTime.fromMillis(Number(createdAt)).toRelativeCalendar()}&nbsp;
        {DateTime.fromMillis(Number(createdAt)).toFormat('T')}
      </S.DateSpan>
      <S.MessageContainer>
        <S.StatusBadge>{badge}</S.StatusBadge>
        <Tooltip title={isCopied ? 'Copied!' : 'Copy'}>
          <S.CopyOutlined onClick={onCopyToClipboard} />
        </Tooltip>
        <S.MessageBodyContainer>
          <S.TitleSpan>{title}</S.TitleSpan>
          <S.MessageSpan>
            <NotificationMarkdown message={message} />
          </S.MessageSpan>
        </S.MessageBodyContainer>
      </S.MessageContainer>
    </S.StyledDiv>
  );
};

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
    if (isNotificationsOpen) {
      dispatch(seenNotifications());
    }
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
