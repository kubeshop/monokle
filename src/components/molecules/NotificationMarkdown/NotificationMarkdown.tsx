import {useMemo} from 'react';
import ReactMarkdown from 'react-markdown';
import {Provider} from 'react-redux';

import {Modal} from 'antd';

import _ from 'lodash';

import {AlertType, ExtraContentType} from '@models/alert';

import store from '@redux/store';

import {TelemetryButtons} from '@molecules/NotificationMarkdown/TelemetryButtons';

import {openUrlInExternalBrowser} from '@utils/shell';

import NotificationModalTitle from './NotificationModalTitle';

import * as S from './styled';

type NotificationProps = {
  notification: AlertType;
  type: string;
};

const getExtraContent = (extraContentType: ExtraContentType, notificationId?: string) => {
  if (extraContentType === ExtraContentType.Telemetry) {
    return <TelemetryButtons notificationId={notificationId} />;
  }
};

const NotificationMarkdown: React.FC<NotificationProps> = props => {
  const {notification, type} = props;
  const {extraContentType, id, message, title} = notification;

  const truncatedMessage = useMemo(() => {
    if (message.length <= 200) {
      return message;
    }

    return _.truncate(message, {length: 200});
  }, [message]);

  const handleSeeMore = () => {
    // @ts-ignore
    Modal[type]({
      content: <S.NotificationModalContent>{message}</S.NotificationModalContent>,
      title: (
        <Provider store={store}>
          <NotificationModalTitle message={message} title={title} />
        </Provider>
      ),
      width: 600,
    });
  };

  return (
    <S.NotificationMarkdownContainer>
      <ReactMarkdown
        components={{
          a({href, children, ...restProps}) {
            return (
              <a onClick={() => openUrlInExternalBrowser(href)} {...restProps}>
                {children}
              </a>
            );
          },
        }}
      >
        {truncatedMessage}
      </ReactMarkdown>

      {message.length > 200 && (
        <S.SeeAllButton type="link" onClick={handleSeeMore}>
          See more
        </S.SeeAllButton>
      )}
      {extraContentType && getExtraContent(extraContentType, id)}
    </S.NotificationMarkdownContainer>
  );
};

export default NotificationMarkdown;
