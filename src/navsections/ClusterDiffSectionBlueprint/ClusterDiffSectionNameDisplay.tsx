import {Button} from 'antd';
import React from 'react';
import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {isInPreviewModeSelector} from '@redux/selectors';
import {stopPreview} from '@redux/services/preview';
import {loadClusterDiff} from '@redux/thunks/loadClusterDiff';

import {PreviewDropdown} from '@components/molecules';

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
  margin-left: 8px;
  font-size: 16px;
`;

const TagWrapper = styled.div`
  width: 250px;
`;

const Spacing = styled.div`
  width: 60px;
`;

const StyledTitle = styled.h1`
  padding: 0;
  margin: 0;
  font-size: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
  margin-bottom: 8px;
`;

const ReloadButton = styled(Button)`
  margin-top: 1px;
`;

function ResourceDiffSectionNameDisplay() {
  const dispatch = useAppDispatch();
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);

  const onClickReload = () => {
    dispatch(loadClusterDiff());
  };

  const onClickExitPreview = () => {
    stopPreview(dispatch);
  };

  return (
    <NameDisplayContainer>
      <TagsContainer>
        <TagWrapper>
          <StyledTitle>Local Resources</StyledTitle>
          {isInPreviewMode && (
            <Button type="primary" ghost onClick={onClickExitPreview}>
              Exit preview
            </Button>
          )}
          <PreviewDropdown />
        </TagWrapper>
        <Spacing />
        <TagWrapper>
          <StyledTitle>Cluster Resources</StyledTitle>
          <ReloadButton icon={<ReloadOutlined />} onClick={onClickReload} type="primary" ghost>
            Reload
          </ReloadButton>
        </TagWrapper>
      </TagsContainer>
    </NameDisplayContainer>
  );
}

export default ResourceDiffSectionNameDisplay;
