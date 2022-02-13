import ReactMarkdown from 'react-markdown';

import {openUrlInExternalBrowser} from '@utils/shell';

const NotificationMarkdown = ({message}: any) => {
  return (
    <ReactMarkdown
      components={{
        a(prps: any) {
          return <a onClick={() => openUrlInExternalBrowser(prps.href)}>{prps.children}</a>;
        },
      }}
    >
      {message}
    </ReactMarkdown>
  );
};

export default NotificationMarkdown;
