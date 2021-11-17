import {Button, Tag} from 'antd';
import React from 'react';
import styled from 'styled-components';

import {useAppDispatch} from '@redux/hooks';
import {loadClusterDiff} from '@redux/thunks/loadClusterDiff';

import {ReloadOutlined} from '@ant-design/icons';

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
  width: 250px;
`;

const Spacing = styled.div`
  width: 60px;
`;

const StyledTag = styled(Tag)`
  padding: 5px 10px;
  font-size: 14px;
  font-weight: 600;
`;

const ReloadButton = styled(Button)`
  margin-top: 1px;
  margin-left: 8px;
`;

function ResourceDiffSectionNameDisplay() {
  const dispatch = useAppDispatch();
  const onClickReload = () => {
    dispatch(loadClusterDiff());
  };

  return (
    <NameDisplayContainer>
      <TagsContainer>
        <TagWrapper>
          <StyledTag>Local Resources</StyledTag>
        </TagWrapper>
        <Spacing />
        <TagWrapper>
          <StyledTag>Cluster Resources</StyledTag>
          <ReloadButton icon={<ReloadOutlined />} onClick={onClickReload} size="small" type="primary" ghost>
            Reload
          </ReloadButton>
        </TagWrapper>
      </TagsContainer>
    </NameDisplayContainer>
  );
}

export default ResourceDiffSectionNameDisplay;
