import {ReactMarkdown} from 'react-markdown/lib/react-markdown';
import {useAsync} from 'react-use';

import {Skeleton, Typography} from 'antd';

import remarkGfm from 'remark-gfm';
import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';

import {getHelmReleaseNotesCommand} from '@utils/helm';

import {openUrlInExternalBrowser} from '@shared/utils';
import {runCommandInMainThread} from '@shared/utils/commands';

const HelmReleaseNotes = () => {
  const selectedHelmRelease = useAppSelector(state => state.dashboard.helm.selectedHelmRelease);

  const {value = '', loading} = useAsync(async () => {
    if (selectedHelmRelease === null) {
      return '';
    }
    const result = await runCommandInMainThread(
      getHelmReleaseNotesCommand({release: selectedHelmRelease.name, namespace: selectedHelmRelease.namespace})
    );
    if (result.stderr) {
      throw new Error(result.stderr);
    }
    return result.stdout;
  }, [selectedHelmRelease?.name, selectedHelmRelease?.namespace]);

  return loading ? (
    <Skeleton active={loading} />
  ) : (
    <div style={{height: 'calc(100vh - 200px)', overflow: 'auto'}}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({href, children, ...restProps}) {
            return (
              <a onClick={() => openUrlInExternalBrowser(href)} {...restProps}>
                {children}
              </a>
            );
          },
          h1({children, ...restProps}) {
            return <H1 {...restProps}>{children}</H1>;
          },
          h2({children, ...restProps}) {
            return <H2 {...restProps}>{children}</H2>;
          },
        }}
      >
        {value}
      </ReactMarkdown>
    </div>
  );
};

export default HelmReleaseNotes;

export const H1 = styled(Typography.Text)`
  font-size: 16px;
  font-weight: bold;
`;

export const H2 = styled(Typography.Text)`
  font-size: 14px;
  font-weight: bold;
`;
