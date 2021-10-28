import React, {useContext} from 'react';
import {MonoPaneTitle} from '@components/atoms';
import HelmChartSectionBlueprint, {HelmChartScopeType} from '@src/navsections/HelmChartSectionBlueprint';
import KustomizationSectionBlueprint, {KustomizationScopeType} from '@src/navsections/KustomizationSectionBlueprint';
import {SectionRenderer} from '@components/molecules';
import AppContext from '@src/AppContext';
import {NAVIGATOR_HEIGHT_OFFSET} from '@constants/constants';
import {HelmValuesFile} from '@models/helm';
import {K8sResource} from '@models/k8sresource';
import * as S from './NavigatorDiff.styled';

function NavigatorDiff(props: {hideTitleBar?: boolean}) {
  const {hideTitleBar = false} = props;
  const {windowSize} = useContext(AppContext);
  const windowHeight = windowSize.height;
  const navigatorHeight = windowHeight - NAVIGATOR_HEIGHT_OFFSET;

  return (
    <>
      {!hideTitleBar && (
        <S.TitleBar>
          <MonoPaneTitle>Navigator Diff</MonoPaneTitle>
        </S.TitleBar>
      )}
      <S.List height={navigatorHeight}>
        <SectionRenderer<HelmValuesFile, HelmChartScopeType>
          sectionBlueprint={HelmChartSectionBlueprint}
          level={0}
          isLastSection={false}
        />
        <SectionRenderer<K8sResource, KustomizationScopeType>
          sectionBlueprint={KustomizationSectionBlueprint}
          level={0}
          isLastSection={false}
        />
      </S.List>
    </>
  );
}

export default NavigatorDiff;
