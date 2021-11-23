import React, {useContext} from 'react';

import {NAVIGATOR_HEIGHT_OFFSET} from '@constants/constants';

import {K8sResource} from '@models/k8sresource';

import {MonoPaneTitle} from '@components/atoms';
import {SectionRenderer} from '@components/molecules';

import AppContext from '@src/AppContext';
import KustomizationSectionBlueprint, {KustomizationScopeType} from '@src/navsections/KustomizationSectionBlueprint';

import * as S from './styled';

const HelmPane: React.FC = () => {
  const {windowSize} = useContext(AppContext);
  const windowHeight = windowSize.height;
  const navigatorHeight = windowHeight - NAVIGATOR_HEIGHT_OFFSET;

  return (
    <>
      <S.TitleBar>
        <MonoPaneTitle>Kustomize</MonoPaneTitle>
      </S.TitleBar>
      <S.List height={navigatorHeight}>
        <SectionRenderer<K8sResource, KustomizationScopeType>
          sectionBlueprint={KustomizationSectionBlueprint}
          level={0}
          isLastSection={false}
        />
      </S.List>
    </>
  );
};

export default HelmPane;
