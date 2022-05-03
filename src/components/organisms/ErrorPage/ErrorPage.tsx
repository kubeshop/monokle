import {shell} from 'electron';

import {useCallback, useMemo, useState} from 'react';
import {FallbackProps} from 'react-error-boundary';

import {ExportOutlined} from '@ant-design/icons';

import newGithubIssueUrl from 'new-github-issue-url';

import SelectFolder from '@assets/FromFolder.svg';
import BigSvg from '@assets/ValidationFigure.svg';

import * as S from './ErrorPage.styled';

export const ErrorPage: React.FC<FallbackProps> = ({error, resetErrorBoundary}) => {
  const [showError, setShowError] = useState<boolean>(false);

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

  const actions = useMemo(() => {
    return [
      {
        logo: SelectFolder,
        description: 'Continue your work by going to project selection.',
        button: 'Go home',
        external: false,
        onClick: resetErrorBoundary,
      },
      {
        logo: SelectFolder,
        description: 'Help us make Monokle better by creating an issue on GitHub.',
        button: 'Report prefilled bug',
        external: true,
        onClick: createGitHubIssue,
      },
    ];
  }, [resetErrorBoundary, createGitHubIssue]);

  return (
    <S.Container>
      <S.ErrorContainer>
        <S.ErrorFigure src={BigSvg} />

        <S.ErrorDescription id="recent-projects-container">
          <S.ErrorButton type="link" onClick={() => setShowError(!showError)}>
            {showError ? 'hide error stack' : 'show error stack'}
          </S.ErrorButton>

          {!showError ? null : (
            <>
              <code>{error.message}</code>
              <pre>
                <code>{error.stack}</code>
              </pre>
            </>
          )}
        </S.ErrorDescription>
      </S.ErrorContainer>

      <S.Actions>
        <S.ActionItems>
          {actions.map(action => (
            <S.ActionItem>
              <S.ActionItemLogo src={action.logo} />
              <S.ActionItemContext>
                <S.ActionItemText>{action.description}</S.ActionItemText>
                <S.ActionItemButton type="link" onClick={action.onClick}>
                  {action.button}
                  {action.external ? <ExportOutlined /> : null}
                </S.ActionItemButton>
              </S.ActionItemContext>
            </S.ActionItem>
          ))}
        </S.ActionItems>
      </S.Actions>
    </S.Container>
  );
};
