import React from 'react';
import {useMeasure} from 'react-use';

import {SectionRenderer, TitleBar} from '@molecules';

import RootHelmChartsSectionBlueprint from '@src/navsections/HelmChartSectionBlueprint';

import * as S from './styled';

const HelmPane: React.FC = () => {
  const [listRef, {height}] = useMeasure<HTMLDivElement>();

  return (
    <S.HelmPaneContainer id="HelmPane">
      <TitleBar title="Helm" closable />
      <S.List id="helm-sections-container" ref={listRef}>
        <SectionRenderer sectionBlueprint={RootHelmChartsSectionBlueprint} height={height} />
      </S.List>
    </S.HelmPaneContainer>
  );
};

export default HelmPane;
