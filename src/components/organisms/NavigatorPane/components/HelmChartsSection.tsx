import React from 'react';

import NavigatorHelmRow from '@molecules/NavigatorHelmRow';
import {HelmChart} from '@models/helm';
import {MonoSectionTitle} from '@atoms';
import {HelmChartMapType} from '@models/appstate';

import SectionRow from './SectionRow';
import SectionCol from './SectionCol';

type HelmChartsSectionProps = {
  helmCharts: HelmChartMapType;
};

const HelmChartsSection = (props: HelmChartsSectionProps) => {
  const {helmCharts} = props;

  return (
    <SectionRow>
      <SectionCol>
        <SectionRow>
            <MonoSectionTitle>Helm Charts</MonoSectionTitle>
        </SectionRow>
        {Object.values(helmCharts).map((chart: HelmChart) => {
          return <NavigatorHelmRow key={chart.id} rowKey={chart.id} helmChart={chart} />;
        })}
      </SectionCol>
    </SectionRow>
  );
};

export default HelmChartsSection;
