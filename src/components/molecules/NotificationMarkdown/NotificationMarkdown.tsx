import ReactMarkdown from 'react-markdown';

import {ExtraContentType} from '@models/alert';

import {TelemetryButtons} from '@molecules/NotificationMarkdown/TelemetryButtons';

import {openUrlInExternalBrowser} from '@utils/shell';

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

const NotificationMarkdown = ({message, extraContentType, notificationId}: NotificationProps) => {
  return (
    <div>
      <ReactMarkdown
        components={{
          a({href, children, ...props}) {
            return (
              <a onClick={() => openUrlInExternalBrowser(href)} {...props}>
                {children}
              </a>
            );
          },
        }}
      >
        {message}
      </ReactMarkdown>
      {extraContentType && getExtraContent(extraContentType, notificationId)}
    </div>
  );
};

export default NotificationMarkdown;
