import React, {useContext} from 'react';

import {NAVIGATOR_HEIGHT_OFFSET} from '@constants/constants';

import {HelmValuesFile} from '@models/helm';

import {MonoPaneTitle} from '@components/atoms';
import {SectionRenderer} from '@components/molecules';

import AppContext from '@src/AppContext';
import HelmChartSectionBlueprint, {HelmChartScopeType} from '@src/navsections/HelmChartSectionBlueprint';

import * as S from './styled';

const HelmPane: React.FC = () => {
  const {windowSize} = useContext(AppContext);
  const windowHeight = windowSize.height;
  const navigatorHeight = windowHeight - NAVIGATOR_HEIGHT_OFFSET;

  return (
    <>
      <S.TitleBar>
        <MonoPaneTitle>Helm</MonoPaneTitle>
      </S.TitleBar>
      <S.List height={navigatorHeight}>
        <SectionRenderer<HelmValuesFile, HelmChartScopeType>
          sectionBlueprint={HelmChartSectionBlueprint}
          level={0}
          isLastSection={false}
        />
      </S.List>
    </>
  );
};

export default HelmPane;
