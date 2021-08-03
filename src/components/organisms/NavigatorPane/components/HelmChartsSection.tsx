import React from 'react';

import NavigatorHelmRow from '@molecules/NavigatorHelmRow';
import {HelmChart} from '@models/helm';
import {HelmChartMapType} from '@models/appstate';

type HelmChartsSectionProps = {
  helmCharts: HelmChartMapType;
};

const HelmChartsSection = (props: HelmChartsSectionProps) => {
  const {helmCharts} = props;

  return (
    <>
      {Object.values(helmCharts).map((chart: HelmChart) => {
        return <NavigatorHelmRow key={chart.id} rowKey={chart.id} helmChart={chart} />;
      })}
    </>
  );
};

export default HelmChartsSection;
