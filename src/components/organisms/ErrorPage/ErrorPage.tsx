import {shell} from 'electron';

import {useCallback, useEffect, useState} from 'react';
import {FallbackProps} from 'react-error-boundary';

import {Button, Space} from 'antd';

import {AnimatePresence} from 'framer-motion';
import newGithubIssueUrl from 'new-github-issue-url';

import {logToFile} from '@utils/logToFile';

import crashFigure from '@assets/figures/crash.svg';

import * as S from './ErrorPage.styled';

export const ErrorPage: React.FC<FallbackProps> = ({error, resetErrorBoundary}) => {
  const createGitHubIssue = useCallback(() => {
    const url = newGithubIssueUrl({
      user: 'kubeshop',
      repo: 'monokle',
      title: '[crash] Something went wrong',
      body: `**Describe the bug**\n\n\n**Steps to reproduce**\n\n\n**Stacktrace** \n\n \`\`\`\n${error.message}\n ${error.stack}\n\`\`\``,
      labels: ['bug'],
    });

    shell.openExternal(url);
  }, [error]);

  useEffect(() => {
    logToFile.error(error);
  }, [error]);

  return (
    <S.ErrorContainer>
      <S.Figure src={crashFigure} />
      <S.Heading>Something unexpected happened!</S.Heading>
      <S.Description>But we actually know what it is! (we are not one of those)</S.Description>

      <ErrorStack error={error} />

      <Space size="middle">
        <Button type="default" onClick={createGitHubIssue}>
          Help us by creating an automatic GitHub issue
        </Button>
        <Button type="primary" onClick={resetErrorBoundary}>
          Back to Monokle
        </Button>
      </Space>
    </S.ErrorContainer>
  );
};

function ErrorStack({error}: {error: Error}) {
  const [showError, setShowError] = useState<boolean>(false);

  return (
    <S.ErrorStack>
      <S.ErrorButton type="link" onClick={() => setShowError(!showError)}>
        <Space>
          Show error stack <S.DownOutlined size={4} />
        </Space>
      </S.ErrorButton>
      <AnimatePresence initial={false}>
        {showError && (
          <S.ErrorStackContent
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: {opacity: 1, height: 200},
              collapsed: {opacity: 0, height: 0},
            }}
            transition={{duration: 0.6}}
          >
            <code>{error.message}</code>
            <pre>
              <code>{error.stack}</code>
            </pre>
          </S.ErrorStackContent>
        )}
      </AnimatePresence>
    </S.ErrorStack>
  );
}
