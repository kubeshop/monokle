import {Skeleton, Tag, Typography} from 'antd';

import {useGetHelmChartInfo} from '@hooks/useGetHelmChartInfo';

import helmPlaceholder from '@assets/helm-default-ico.svg';

import {openUrlInExternalBrowser} from '@shared/utils';

import * as S from './HelmInfo.styled';

interface IProps {
  chartName: string;
}

const HelmInfo = ({chartName}: IProps) => {
  const {value: helmChartInfo, loading: loadingHelmInfo} = useGetHelmChartInfo(chartName);

  return loadingHelmInfo ? (
    <Skeleton active={loadingHelmInfo} />
  ) : (
    <S.Container>
      <S.Content>
        <div>
          <S.Header>
            <S.Logo
              width="100"
              height="100"
              loading="lazy"
              decoding="async"
              src={getHelmRepoLogo(helmChartInfo?.icon)}
            />
            <S.ChartInfo>
              <S.Label>
                Author<Typography.Text> {helmChartInfo?.name}</Typography.Text>
              </S.Label>
              <S.Label>
                Repository&nbsp;
                <Typography.Link onClick={() => openUrlInExternalBrowser(helmChartInfo?.home)}>
                  {helmChartInfo?.home}
                </Typography.Link>
              </S.Label>
              <S.Label>
                apiVersion<Typography.Text> {helmChartInfo?.apiVersion}</Typography.Text>
              </S.Label>
              <S.Label>
                appVersion
                <Typography.Text> {helmChartInfo?.appVersion}</Typography.Text>
              </S.Label>
            </S.ChartInfo>
          </S.Header>
        </div>

        {helmChartInfo?.description && (
          <S.Section>
            <S.Heading>Description</S.Heading>
            <S.Description>{helmChartInfo?.description}</S.Description>
          </S.Section>
        )}

        {helmChartInfo?.keywords && (
          <S.Section>
            <S.Heading>Keywords</S.Heading>
            <S.Description>
              {helmChartInfo?.keywords.map(i => (
                <Tag key={i}>{i}</Tag>
              ))}
            </S.Description>
          </S.Section>
        )}

        {helmChartInfo?.kubeVersion && (
          <S.Section>
            <S.Heading>Kube Version</S.Heading>
            <S.Description>{helmChartInfo?.kubeVersion}</S.Description>
          </S.Section>
        )}

        {helmChartInfo?.maintainers && (
          <S.Section>
            <S.Heading>Maintainers</S.Heading>
            <S.Description>
              {helmChartInfo?.maintainers
                .map<React.ReactNode>(m => (
                  <Typography.Link
                    key={m.name}
                    onClick={() => openUrlInExternalBrowser(`https://github.com/${m.name}`)}
                  >
                    {m.name}
                  </Typography.Link>
                ))
                .reduce((prev, curr) => [prev, ', ', curr])}
            </S.Description>
          </S.Section>
        )}

        {helmChartInfo?.sources && (
          <S.Section>
            <S.Heading>Sources</S.Heading>
            {helmChartInfo?.sources.map(s => (
              <S.Description key={s}>
                <Typography.Link onClick={() => openUrlInExternalBrowser(s)}>{s}</Typography.Link>
              </S.Description>
            ))}
          </S.Section>
        )}

        {helmChartInfo?.version && (
          <S.Section>
            <S.Heading>Version</S.Heading>
            <S.Description>{helmChartInfo?.version}</S.Description>
          </S.Section>
        )}
      </S.Content>
    </S.Container>
  );
};

export default HelmInfo;

const getHelmRepoLogo = (iconURL?: string) => {
  return iconURL || helmPlaceholder;
};
