import React from 'react';

import {Divider} from 'antd';

import styled from 'styled-components';

import {ResourceFilterIconWithPopover, SectionRenderer} from '@components/molecules';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

import ClusterDiffSectionBlueprint from '@src/navsections/ClusterDiffSectionBlueprint';

import * as S from './ClusterDiff.styled';
import ClusterDiffNamespaceFilter from './ClusterDiffNamespaceFilter';

const Container = styled.div<{height?: number}>`
  ${props => props.height && `height: ${props.height};`}
`;

const FilterContainer = styled.span`
  margin-left: 10px;
`;

const ListContainer = styled.div`
  overflow-y: scroll;
  height: 70vh;
  ${GlobalScrollbarStyle}
  width: 100%;
`;

function ClusterDiff() {
  return (
    <Container>
      <S.TitleBar>
        <S.TitleBarRightButtons>
          <ClusterDiffNamespaceFilter />
          <FilterContainer>
            <ResourceFilterIconWithPopover />
          </FilterContainer>
        </S.TitleBarRightButtons>
      </S.TitleBar>
      <Divider style={{margin: '8px 0'}} />
      <ListContainer>
        <S.List id="cluster-diff-sections-container">
          <SectionRenderer sectionBlueprint={ClusterDiffSectionBlueprint} level={0} isLastSection={false} />
        </S.List>
      </ListContainer>
    </Container>
  );
}

export default ClusterDiff;
