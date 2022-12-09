import React from 'react';

import {SectionRenderer} from '@molecules';

import {TitleBarWrapper} from '@components/atoms/StyledComponents/TitleBarWrapper';

import RootHelmChartsSectionBlueprint from '@src/navsections/HelmChartSectionBlueprint';

import {TitleBar} from '@monokle/components';

import * as S from './HelmPane.styled';

const HelmPane: React.FC = () => {
  return (
    <S.HelmPaneContainer id="HelmPane">
      <TitleBarWrapper>
        <TitleBar title="Helm" />
      </TitleBarWrapper>

      <S.List id="helm-sections-container">
        <SectionRenderer sectionBlueprint={RootHelmChartsSectionBlueprint} level={0} isLastSection={false} />
      </S.List>
    </S.HelmPaneContainer>
  );
};

export default HelmPane;
