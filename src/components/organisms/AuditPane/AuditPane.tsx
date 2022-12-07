import React from 'react';

import {SectionRenderer, TitleBar} from '@molecules';

import KustomizationSectionBlueprint from '@src/navsections/KustomizationSectionBlueprint';
import KustomizePatchSectionBlueprint from '@src/navsections/KustomizePatchSectionBlueprint';

import * as S from './AuditPane.styled';

const AuditPane: React.FC = () => {
  return (
    <S.AuditPaneContainer id="AuditPane">
      <TitleBar title="Audit" closable />

      <S.List id="audit-sections-container">
        <SectionRenderer sectionBlueprint={KustomizationSectionBlueprint} level={0} isLastSection={false} />
        <SectionRenderer sectionBlueprint={KustomizePatchSectionBlueprint} level={0} isLastSection={false} />
      </S.List>
    </S.AuditPaneContainer>
  );
};

export default AuditPane;
