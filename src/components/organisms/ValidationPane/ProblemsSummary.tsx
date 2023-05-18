import {useEffect, useState} from 'react';
import {ReactMarkdown} from 'react-markdown/lib/react-markdown';

import {Skeleton} from 'antd';

import {createChatCompletion} from '@redux/hackathon/hackathon.ipc';

type IProps = {
  warningsMessages: string[];
  errorsMessages: string[];
};

const ProblemsSummary: React.FC<IProps> = props => {
  const {errorsMessages, warningsMessages} = props;

  const [isLoading, setIsLoading] = useState(false);
  const [summaryContent, setSummaryContent] = useState('');

  useEffect(() => {
    const makeCompletion = async () => {
      setIsLoading(true);

      let modelMessage =
        'Based on the following errors and warnings, related to kubernetes resources, please give a brief summary of what is going on.\n';

      if (warningsMessages.length > 0) {
        modelMessage += 'Warnings: \n';
        warningsMessages.forEach(warning => {
          modelMessage += `${warning}\n`;
        });
      }

      if (errorsMessages.length > 0) {
        modelMessage += 'Errors: \n';
        errorsMessages.forEach(error => {
          modelMessage += `${error}\n`;
        });
      }

      const summary = await createChatCompletion({message: modelMessage});

      if (summary) {
        setSummaryContent(summary);
      }

      setIsLoading(false);
    };

    makeCompletion();
  }, [errorsMessages, warningsMessages]);

  if (isLoading) {
    return <Skeleton active />;
  }

  if (!summaryContent) {
    return <div>No summary available</div>;
  }

  return (
    <span style={{fontSize: '12px'}}>
      <ReactMarkdown>{summaryContent}</ReactMarkdown>
    </span>
  );
};

export default ProblemsSummary;
