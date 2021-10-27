import React, {useCallback} from 'react';
import Drawer from '@components/atoms/Drawer';
import styled from 'styled-components';
import {useAppSelector, useAppDispatch} from '@redux/hooks';
import {toggleNotifications} from '@redux/reducers/ui';
import {ExclamationCircleOutlined, CheckCircleOutlined, InfoCircleOutlined} from '@ant-design/icons';
import Colors, {FontColors} from '@styles/Colors';
import {Badge} from 'antd';
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

const StyledSpan = styled.span`
  font-weight: 500;
  font-size: 12px;
  display: block;
  margin-bottom: 6px;
`;

const StyledDateSpan = styled(StyledSpan)`
  color: ${Colors.grey500};
`;

const StyledMessageSpan = styled(StyledSpan)`
  color: ${Colors.whitePure};
`;

const StyledStatusBadge = styled(Badge)`
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
        notifications.map(notification => (
          <StyledDiv key={notification.id}>
            <StyledDateSpan>
              {DateTime.fromMillis(Number(notification.createdAt)).toRelativeCalendar()}&nbsp;
              {DateTime.fromMillis(Number(notification.createdAt)).toFormat('T')}
            </StyledDateSpan>
            <StyledMessageContainer>
              <StyledStatusBadge>{getNotificationBadge(notification.type)}</StyledStatusBadge>
              <StyledMessageSpan>{notification.message}</StyledMessageSpan>
            </StyledMessageContainer>
          </StyledDiv>
        ))
      ) : (
        <StyledNoNotificationsContainer>There is no notifications to show</StyledNoNotificationsContainer>
      )}
    </Drawer>
  );
};

export default NotificationsDrawer;
