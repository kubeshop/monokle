import {Button, Tag} from 'antd';
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
          <StyledTag>Local Resources</StyledTag>
          {isInPreviewMode && (
            <Button type="primary" ghost onClick={onClickExitPreview} style={{marginLeft: 8}}>
              Exit preview
            </Button>
          )}
          <PreviewDropdown />
        </TagWrapper>
        <Spacing />
        <TagWrapper>
          <StyledTag>Cluster Resources</StyledTag>
          <ReloadButton icon={<ReloadOutlined />} onClick={onClickReload} type="primary" ghost>
            Reload
          </ReloadButton>
        </TagWrapper>
      </TagsContainer>
    </NameDisplayContainer>
  );
}

export default ResourceDiffSectionNameDisplay;
