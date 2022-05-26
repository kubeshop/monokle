import React from 'react';
import {useMeasure} from 'react-use';

import {SectionRenderer, TitleBar} from '@molecules';

import KustomizationSectionBlueprint from '@src/navsections/KustomizationSectionBlueprint';

// import KustomizePatchSectionBlueprint from '@src/navsections/KustomizePatchSectionBlueprint';
import * as S from './styled';

const KustomizePane: React.FC = () => {
  const [listRef, {height}] = useMeasure<HTMLDivElement>();

  return (
    <S.KustomizePaneContainer id="KustomizePane">
      <TitleBar title="Kustomize" closable />

      <S.List id="kustomize-sections-container" ref={listRef}>
        <SectionRenderer sectionBlueprint={KustomizationSectionBlueprint} height={height} />
        {/* <SectionRenderer sectionBlueprint={KustomizePatchSectionBlueprint} height={height} /> */}
      </S.List>
    </S.KustomizePaneContainer>
  );
};

export default KustomizePane;
