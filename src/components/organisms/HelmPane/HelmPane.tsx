import React from 'react';

import {SectionRenderer, TitleBar} from '@molecules';

import HelmChartSectionBlueprint from '@src/navsections/HelmChartSectionBlueprint';

import * as S from './styled';

const HelmPane: React.FC = () => {
  return (
    <S.HelmPaneContainer id="HelmPane">
      <TitleBar title="Helm" />

      <S.List id="helm-sections-container">
        <SectionRenderer sectionBlueprint={HelmChartSectionBlueprint} level={0} isLastSection={false} />
      </S.List>
    </S.HelmPaneContainer>
  );
};

export default HelmPane;
