import ReactMarkdown from 'react-markdown';

import {Skeleton, Typography} from 'antd';

import remarkGfm from 'remark-gfm';
import styled from 'styled-components';

import {useGetHelmChartChangelog} from '@hooks/useGetHelmChartChangelog';

import {openUrlInExternalBrowser} from '@shared/utils';

interface IProps {
  chartName: string;
}

const HelmReadme = ({chartName}: IProps) => {
  const {value = 'No changelog', loading} = useGetHelmChartChangelog(chartName);
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

export default HelmReadme;

export const H1 = styled(Typography.Text)`
  font-size: 16px;
  font-weight: bold;
`;

export const H2 = styled(Typography.Text)`
  font-size: 14px;
  font-weight: bold;
`;
