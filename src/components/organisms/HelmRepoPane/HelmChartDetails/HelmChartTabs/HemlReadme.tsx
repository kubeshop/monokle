import ReactMarkdown from 'react-markdown';

import {Skeleton} from 'antd';

import {useGetHelmChartChangelog} from '@hooks/useGetHelmChartChangelog';

import {openUrlInExternalBrowser} from '@shared/utils';

interface IProps {
  chartName: string;
}

const HelmReadme = ({chartName}: IProps) => {
  const {value = '', loading} = useGetHelmChartChangelog(chartName);
  return loading ? (
    <Skeleton active={loading} />
  ) : (
    <div style={{height: 'calc(100vh - 200px)', overflow: 'auto'}}>
      <ReactMarkdown
        components={{
          a({href, children, ...restProps}) {
            return (
              <a onClick={() => openUrlInExternalBrowser(href)} {...restProps}>
                {children}
              </a>
            );
          },
        }}
      >
        {value}
      </ReactMarkdown>
    </div>
  );
};

export default HelmReadme;
