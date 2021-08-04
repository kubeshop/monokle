import React from 'react';

import NavigatorHelmRow from '@molecules/NavigatorHelmRow';
import {HelmChart} from '@models/helm';
import {HelmChartMapType} from '@models/appstate';
import {useAppSelector} from '@redux/hooks';

type HelmChartsSectionProps = {
  helmCharts: HelmChartMapType;
};

const HelmChartsSection = (props: HelmChartsSectionProps) => {
  const {helmCharts} = props;

  const previewLoader = useAppSelector(state => state.main.previewLoader);

  return (
    <>
      {Object.values(helmCharts).map((chart: HelmChart) => {
        return (
          <NavigatorHelmRow
            key={chart.id}
            rowKey={chart.id}
            helmChart={chart}
            isPreviewLoading={previewLoader.isLoading && chart.id === previewLoader.targetResourceId}
          />
        );
      })}
    </>
  );
};

export default HelmChartsSection;
