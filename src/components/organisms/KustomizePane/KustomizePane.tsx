import React from 'react';

import {SectionRenderer, TitleBar} from '@molecules';

import KustomizationSectionBlueprint from '@src/navsections/KustomizationSectionBlueprint';
import KustomizePatchSectionBlueprint from '@src/navsections/KustomizePatchSectionBlueprint';

import * as S from './styled';

const KustomizePane: React.FC = () => {
  return (
    <S.KustomizePaneContainer id="KustomizePane">
      <TitleBar title="Kustomize" closable />

      <S.List id="kustomize-sections-container">
        <SectionRenderer sectionBlueprint={KustomizationSectionBlueprint} level={0} isLastSection={false} />
        <SectionRenderer sectionBlueprint={KustomizePatchSectionBlueprint} level={0} isLastSection={false} />
      </S.List>
    </S.KustomizePaneContainer>
  );
};

export default KustomizePane;
