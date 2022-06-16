import {Divider} from 'antd';

import {ResourceFilterIconWithPopover, SectionRenderer} from '@components/molecules';

import ClusterDiffSectionBlueprint from '@src/navsections/ClusterDiffSectionBlueprint';

import * as S from './ClusterDiff.styled';
import ClusterDiffNamespaceFilter from './ClusterDiffNamespaceFilter';

function ClusterDiff() {
  return (
    <S.Container>
      <S.TitleBar>
        <S.TitleBarRightButtons>
          <ClusterDiffNamespaceFilter />
          <S.FilterContainer>
            <ResourceFilterIconWithPopover />
          </S.FilterContainer>
        </S.TitleBarRightButtons>
      </S.TitleBar>
      <Divider style={{margin: '8px 0'}} />
      <S.ListContainer>
        <S.List id="cluster-diff-sections-container">
          <SectionRenderer sectionBlueprint={ClusterDiffSectionBlueprint} level={0} isLastSection={false} />
        </S.List>
      </S.ListContainer>
    </S.Container>
  );
}

export default ClusterDiff;
