import {useMemo} from 'react';
import ReactMarkdown from 'react-markdown';

import _ from 'lodash';

import {ExtraContentType} from '@models/alert';

import {TelemetryButtons} from '@molecules/NotificationMarkdown/TelemetryButtons';

import {openUrlInExternalBrowser} from '@utils/shell';

import * as S from './styled';

type NotificationProps = {
  message: string;
  extraContentType?: ExtraContentType;
  notificationId?: string;
};

const getExtraContent = (extraContentType: ExtraContentType, notificationId?: string) => {
  if (extraContentType === ExtraContentType.Telemetry) {
    return <TelemetryButtons notificationId={notificationId} />;
  }
};

const NotificationMarkdown: React.FC<NotificationProps> = props => {
  const {extraContentType, message, notificationId} = props;

  const truncatedMessage = useMemo(() => {
    if (message.length <= 200) {
      return message;
    }

    return _.truncate(message, {length: 200});
  }, [message]);

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
      {message.length > 200 && <S.SeeAllButton type="link">See more</S.SeeAllButton>}
      {extraContentType && getExtraContent(extraContentType, notificationId)}
    </S.NotificationMarkdownContainer>
  );
};

export default NotificationMarkdown;
