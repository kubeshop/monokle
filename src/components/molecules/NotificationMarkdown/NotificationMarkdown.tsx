import ReactMarkdown from 'react-markdown';

import {openUrlInExternalBrowser} from '@utils/shell';

type NotificationProps = {
  message: string;
};

const NotificationMarkdown = ({message}: NotificationProps) => {
  return (
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
  );
};

export default NotificationMarkdown;
