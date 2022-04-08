import React from 'react';

import {SectionRenderer, TitleBar} from '@molecules';

import RootHelmChartsSectionBlueprint from '@src/navsections/HelmChartSectionBlueprint';

import * as S from './styled';

const HelmPane: React.FC = () => {
  return (
    <S.HelmPaneContainer id="HelmPane">
      <TitleBar title="Helm" closable />
      <S.List id="helm-sections-container">
        <SectionRenderer sectionBlueprint={RootHelmChartsSectionBlueprint} level={0} isLastSection={false} />
      </S.List>
    </S.HelmPaneContainer>
  );
};

export default HelmPane;
