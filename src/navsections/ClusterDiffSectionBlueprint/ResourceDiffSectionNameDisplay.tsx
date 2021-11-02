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
`;

const TagWrapper = styled.div`
  width: 300px;
`;

const Spacing = styled.div`
  width: 60px;
`;

const Title = styled.h1`
  display: block;
  width: 100%;
  flex: 0 0 100%;
`;

function ResourceDiffSectionNameDisplay() {
  return (
    <NameDisplayContainer>
      <Title>K8s Resource Diff</Title>
      <TagsContainer>
        <TagWrapper>
          <Tag>Local</Tag>
        </TagWrapper>
        <Spacing />
        <TagWrapper>
          <Tag>Cluster</Tag>
        </TagWrapper>
      </TagsContainer>
    </NameDisplayContainer>
  );
}

export default ResourceDiffSectionNameDisplay;
