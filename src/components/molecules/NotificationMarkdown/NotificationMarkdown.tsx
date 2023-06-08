import {useMemo} from 'react';
import ReactMarkdown from 'react-markdown';
import {Provider} from 'react-redux';

import {Button, Modal} from 'antd';

import _ from 'lodash';

import {useAppDispatch} from '@redux/hooks';
import store from '@redux/store';

import {TelemetryButtons} from '@molecules/NotificationMarkdown/TelemetryButtons';

import {AlertType, ExtraContentType} from '@shared/models/alert';
import {openUrlInExternalBrowser} from '@shared/utils/shell';

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
  const dispatch = useAppDispatch();
  const {extraContentType, id, message, title, buttons} = notification;

  const truncatedMessage = useMemo(() => {
    if (message.length <= 200) {
      return message;
    }

    return _.truncate(message, {length: 240});
  }, [message]);

  const handleSeeMore = () => {
    // @ts-ignore
    Modal[type]({
      content: (
        <S.NotificationModalContent>
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
            {message}
          </ReactMarkdown>
          {/* <S.ButtonContainer>
            {
              buttons?.map(button => (
                button.text === 'Cancel' ?
                  <S.CancelButton onClick={() => Modal.destroyAll()}>{button.text}</S.CancelButton> :
                  <S.DefaultActionButton onClick={() => dispatch(button.action)}>{button.text}</S.DefaultActionButton>
              ))
            }
          </S.ButtonContainer> */}
        </S.NotificationModalContent>
      ),
      title: (
        <Provider store={store}>
          <NotificationModalTitle message={message} title={title} />
        </Provider>
      ),
      width: 600,
      cancel: 'Cancel',
      okText: 'Done',
    });
  };

  return (
    <S.NotificationMarkdownContainer>
      <ReactMarkdown
        components={{
          p: 'pre',
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
      <div>
        {buttons?.map(button => (
          <Button
            key={button.text}
            style={button.style}
            onClick={() => {
              dispatch(button.action);
            }}
          >
            {button.text}
          </Button>
        ))}
      </div>
    </S.NotificationMarkdownContainer>
  );
};

export default NotificationMarkdown;
