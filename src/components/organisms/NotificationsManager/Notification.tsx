import {Tooltip} from 'antd';

import {DateTime} from 'luxon';

import {AlertType} from '@models/alert';

import NotificationMarkdown from '@molecules/NotificationMarkdown';

import {useCopyToClipboard} from '@hooks/useCopyToClipboard';

import * as S from './Notification.styled';

type NotificationProps = {
  notification: AlertType;
  badge: JSX.Element;
};

const Notification: React.FC<NotificationProps> = props => {
  const {notification, badge} = props;

  const {createdAt, title, message, extraContentType, hasSeen, type} = notification;

  const copyToClipboardMessage = `Title: ${title}. Description: ${message}.`;

  const {isCopied, setCopyToClipboardState} = useCopyToClipboard(copyToClipboardMessage);

  const onCopyToClipboard = () => {
    if (isCopied) {
      return;
    }

    setCopyToClipboardState(true);
  };

  return (
    <S.NotificationContainer $isNew={!hasSeen} $type={type} key={notification.id}>
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
            <NotificationMarkdown message={message} extraContentType={extraContentType} />
          </S.MessageSpan>
        </S.MessageBodyContainer>
      </S.MessageContainer>
    </S.NotificationContainer>
  );
};

export default Notification;
