import {ipcRenderer, shell} from 'electron';

import {useCallback, useEffect} from 'react';
import {FallbackProps} from 'react-error-boundary';

import {Button, Space} from 'antd';

import newGithubIssueUrl from 'new-github-issue-url';

import crashFigure from '@assets/figures/crash.svg';

import {logToFile} from '@shared/utils/logs';

import * as S from './ErrorPage.styled';
import {ErrorStack} from './ErrorStack';

interface CustomFallbackProps extends FallbackProps {
  hideBackButton?: boolean;
}

export const ErrorPage: React.FC<CustomFallbackProps> = ({hideBackButton, error}) => {
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

  const onRestart = useCallback(() => {
    ipcRenderer.send('force-reload');
  }, []);

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
        {!hideBackButton && (
          <Button type="primary" onClick={onRestart}>
            Back to Monokle
          </Button>
        )}
      </Space>
    </S.ErrorContainer>
  );
};
