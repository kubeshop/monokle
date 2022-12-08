import React from 'react';

import {SectionRenderer} from '@molecules';

import {TitleBarWrapper} from '@components/atoms/StyledComponents/TitleBarWrapper';

import KustomizationSectionBlueprint from '@src/navsections/KustomizationSectionBlueprint';
import KustomizePatchSectionBlueprint from '@src/navsections/KustomizePatchSectionBlueprint';

import * as S from './KustomizePane.styled';

const KustomizePane: React.FC = () => {
  return (
    <S.KustomizePaneContainer id="KustomizePane">
      <TitleBarWrapper title="Kustomize" />

      <S.List id="kustomize-sections-container">
        <SectionRenderer sectionBlueprint={KustomizationSectionBlueprint} level={0} isLastSection={false} />
        <SectionRenderer sectionBlueprint={KustomizePatchSectionBlueprint} level={0} isLastSection={false} />
      </S.List>
    </S.KustomizePaneContainer>
  );
};

export default KustomizePane;
