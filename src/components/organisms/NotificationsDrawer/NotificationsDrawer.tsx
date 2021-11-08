import React, {useCallback} from 'react';
import Drawer from '@components/atoms/Drawer';
import styled from 'styled-components';
import {useCopyToClipboard} from '@hooks/useCopyToClipboard';
import {useAppSelector, useAppDispatch} from '@redux/hooks';
import {toggleNotifications} from '@redux/reducers/ui';
import {ExclamationCircleOutlined, CheckCircleOutlined, InfoCircleOutlined, CopyOutlined} from '@ant-design/icons';
import Colors, {FontColors} from '@styles/Colors';
import {Badge, Tooltip} from 'antd';
import {AlertEnum, AlertType} from '@models/alert';
import {DateTime} from 'luxon';

const StyledDiv = styled.div`
  margin-bottom: 12px;
`;

const StyledMessageContainer = styled(StyledDiv)`
  display: flex;
  justify-content: space-between;
`;

const StyledNoNotificationsContainer = styled(StyledDiv)`
  display: flex;
  justify-content: center;
`;

const StyledMessageBodyContainer = styled(StyledDiv)`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledSpan = styled.span`
  font-weight: 500;
  font-size: 12px;
  display: block;
  margin-bottom: 6px;
`;

const StyledDateSpan = styled(StyledSpan)`
  color: ${Colors.grey500};
`;

const StyledTitleSpan = styled(StyledSpan)`
  color: ${Colors.whitePure};
  width: 100%;
  font-size: 14px;
  font-weight: 600;
`;

const StyledMessageSpan = styled(StyledSpan)`
  color: ${Colors.whitePure};
  width: 100%;
  margin-bottom: 0px;
`;

const StyledStatusBadge = styled(Badge)`
  margin-right: 8px;
  margin-top: 4px;
`;

const StyledCopyOutlined = styled(CopyOutlined)`
  margin-right: 8px;
  margin-top: 4px;
`;

const StyledExclamationCircleOutlined = styled(ExclamationCircleOutlined)`
  color: ${FontColors.error};
  font-size: 16px;
`;

const StyledCheckCircleOutlined = styled(CheckCircleOutlined)`
  color: ${Colors.greenOkay};
  font-size: 16px;
`;

const StyledInfoCircleOutlined = styled(InfoCircleOutlined)`
  color: ${Colors.cyan};
  font-size: 16px;
`;

const StyledExclamationCircleOutlinedWarning = styled(ExclamationCircleOutlined)`
  color: ${Colors.yellowWarning};
  font-size: 16px;
`;

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
    <StyledDiv key={notification.id}>
      <StyledDateSpan>
        {DateTime.fromMillis(Number(createdAt)).toRelativeCalendar()}&nbsp;
        {DateTime.fromMillis(Number(createdAt)).toFormat('T')}
      </StyledDateSpan>
      <StyledMessageContainer>
        <StyledStatusBadge>{badge}</StyledStatusBadge>
        <Tooltip title={isCopied ? 'Copied!' : 'Copy'}>
          <StyledCopyOutlined onClick={onCopyToClipboard} />
        </Tooltip>
        <StyledMessageBodyContainer>
          <StyledTitleSpan>{title}</StyledTitleSpan>
          <StyledMessageSpan>{message}</StyledMessageSpan>
        </StyledMessageBodyContainer>
      </StyledMessageContainer>
    </StyledDiv>
  );
};

const NotificationsDrawer = () => {
  const dispatch = useAppDispatch();
  const isNotificationsOpen = Boolean(useAppSelector(state => state.ui.isNotificationsOpen));
  const notifications: AlertType[] = useAppSelector(state => state.main.notifications);

  const toggleSettingsDrawer = () => {
    dispatch(toggleNotifications());
  };

  const getNotificationBadge = useCallback(
    (type: AlertEnum) => {
      if (type === AlertEnum.Success) {
        return <StyledCheckCircleOutlined />;
      }
      if (type === AlertEnum.Warning) {
        return <StyledExclamationCircleOutlinedWarning />;
      }
      if (type === AlertEnum.Error) {
        return <StyledExclamationCircleOutlined />;
      }
      return <StyledInfoCircleOutlined />;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notifications]
  );

  return (
    <Drawer
      width="400"
      noborder="true"
      title="Notifications"
      placement="right"
      closable={false}
      onClose={toggleSettingsDrawer}
      visible={isNotificationsOpen}
    >
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
        <StyledNoNotificationsContainer>There is no notifications to show</StyledNoNotificationsContainer>
      )}
    </Drawer>
  );
};

export default NotificationsDrawer;
