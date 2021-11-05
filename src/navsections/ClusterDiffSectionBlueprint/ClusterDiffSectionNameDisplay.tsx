import React from 'react';
import styled from 'styled-components';
import {Tag} from 'antd';

const NameDisplayContainer = styled.div`
  margin-left: 16px;
  padding-top: 8px;
  padding-bottom: 8px;
`;

const TagsContainer = styled.div`
  width: 800px;
  display: flex;
  justify-content: space-between;
  margin-left: 24px;
  font-size: 16px;
  margin-top: 16px;
`;

const TagWrapper = styled.div`
  width: 300px;
`;

const Spacing = styled.div`
  width: 60px;
`;

const StyledTag = styled(Tag)`
  padding: 5px 10px;
  font-size: 14px;
`;

function ResourceDiffSectionNameDisplay() {
  return (
    <NameDisplayContainer>
      <TagsContainer>
        <TagWrapper>
          <StyledTag>Local Resources</StyledTag>
        </TagWrapper>
        <Spacing />
        <TagWrapper>
          <StyledTag>Cluster Resources</StyledTag>
        </TagWrapper>
      </TagsContainer>
    </NameDisplayContainer>
  );
}

export default ResourceDiffSectionNameDisplay;
