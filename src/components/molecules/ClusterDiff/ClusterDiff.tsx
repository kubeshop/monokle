import {ResourceFilterIconWithPopover, SectionRenderer} from '@components/molecules';

import ClusterDiffSectionBlueprint from '@src/navsections/ClusterDiffSectionBlueprint';

import * as S from './ClusterDiff.styled';
import ClusterDiffNamespaceFilter from './ClusterDiffNamespaceFilter';

const ClusterDiff: React.FC = () => (
  <S.Container>
    <S.TitleBar>
      <S.TitleBarRightButtons>
        <ClusterDiffNamespaceFilter />
        <S.FilterContainer>
          <ResourceFilterIconWithPopover />
        </S.FilterContainer>
      </S.TitleBarRightButtons>
    </S.TitleBar>

    <S.Divider />

    <S.ListContainer>
      <S.List id="cluster-diff-sections-container">
        <SectionRenderer sectionBlueprint={ClusterDiffSectionBlueprint} level={0} isLastSection={false} />
      </S.List>
    </S.ListContainer>
  </S.Container>
);

export default ClusterDiff;
