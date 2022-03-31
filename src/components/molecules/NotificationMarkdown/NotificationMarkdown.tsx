import ReactMarkdown from 'react-markdown';

import {ExtraContentType} from '@models/alert';

import {TelemetryButtons} from '@molecules/NotificationMarkdown/TelemetryButtons';

import {openUrlInExternalBrowser} from '@utils/shell';

type NotificationProps = {
  message: string;
  extraContentType?: ExtraContentType;
};

const getExtraContent = (extraContentType: ExtraContentType) => {
  if (extraContentType === ExtraContentType.Telemetry) {
    return <TelemetryButtons />;
  }
};

const NotificationMarkdown = ({message, extraContentType}: NotificationProps) => {
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
      {extraContentType && getExtraContent(extraContentType)}
    </div>
  );
};

export default NotificationMarkdown;
