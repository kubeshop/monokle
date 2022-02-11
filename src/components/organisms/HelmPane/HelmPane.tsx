import React, {useContext} from 'react';

import {NAVIGATOR_HEIGHT_OFFSET} from '@constants/constants';

import {MonoPaneTitle} from '@components/atoms';
import {SectionRenderer} from '@components/molecules';

import AppContext from '@src/AppContext';
import RootHelmChartsSectionBlueprint from '@src/navsections/HelmChartSectionBlueprint';

import * as S from './styled';

const HelmPane: React.FC = () => {
  const {windowSize} = useContext(AppContext);
  const windowHeight = windowSize.height;
  const navigatorHeight = windowHeight - NAVIGATOR_HEIGHT_OFFSET;

  return (
    <span id="HelmPane">
      <S.TitleBar>
        <MonoPaneTitle>Helm</MonoPaneTitle>
      </S.TitleBar>
      <S.List id="helm-sections-container" height={navigatorHeight}>
        <SectionRenderer sectionBlueprint={RootHelmChartsSectionBlueprint} level={0} isLastSection={false} />
      </S.List>
    </span>
  );
};

export default HelmPane;
