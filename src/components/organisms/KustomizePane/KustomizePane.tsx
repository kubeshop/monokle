import React from 'react';

import {SectionRenderer} from '@molecules';

import KustomizationSectionBlueprint from '@src/navsections/KustomizationSectionBlueprint';
import KustomizePatchSectionBlueprint from '@src/navsections/KustomizePatchSectionBlueprint';

import {TitleBar} from '@monokle/components';

import * as S from './KustomizePane.styled';

const KustomizePane: React.FC = () => {
  return (
    <S.KustomizePaneContainer id="KustomizePane">
      <TitleBar title="Kustomize" />

      <S.List id="kustomize-sections-container">
        <SectionRenderer sectionBlueprint={KustomizationSectionBlueprint} level={0} isLastSection={false} />
        <SectionRenderer sectionBlueprint={KustomizePatchSectionBlueprint} level={0} isLastSection={false} />
      </S.List>
    </S.KustomizePaneContainer>
  );
};

export default KustomizePane;
