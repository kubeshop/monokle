import React, {useContext} from 'react';

import {NAVIGATOR_HEIGHT_OFFSET} from '@constants/constants';

import {MonoPaneTitle} from '@components/atoms';
import {SectionRenderer} from '@components/molecules';

import AppContext from '@src/AppContext';
import KustomizationSectionBlueprint from '@src/navsections/KustomizationSectionBlueprint';
import KustomizePatchSectionBlueprint from '@src/navsections/KustomizePatchSectionBlueprint';

import * as S from './styled';

const KustomizePane: React.FC = () => {
  const {windowSize} = useContext(AppContext);
  const windowHeight = windowSize.height;
  const navigatorHeight = windowHeight - NAVIGATOR_HEIGHT_OFFSET;

  return (
    <span id="KustomizePane">
      <S.TitleBar>
        <MonoPaneTitle>Kustomize</MonoPaneTitle>
      </S.TitleBar>
      <S.List id="kustomize-sections-container" height={navigatorHeight}>
        <SectionRenderer sectionBlueprint={KustomizationSectionBlueprint} level={0} isLastSection={false} />
        <SectionRenderer sectionBlueprint={KustomizePatchSectionBlueprint} level={0} isLastSection={false} />
      </S.List>
    </span>
  );
};

export default KustomizePane;
