import React from 'react';

import {Button, Checkbox} from 'antd';

import {ReloadOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectAllClusterDiffMatches, unselectAllClusterDiffMatches} from '@redux/reducers/main';
import {isInPreviewModeSelector} from '@redux/selectors';
import {stopPreview} from '@redux/services/preview';
import {loadClusterDiff} from '@redux/thunks/loadClusterDiff';

import {PreviewDropdown} from '@components/molecules';

const NameDisplayContainer = styled.div`
  margin-left: 16px;
  padding-top: 8px;
  padding-bottom: 8px;
`;

const TagsContainer = styled.div`
  width: 900px;
  display: flex;
  justify-content: space-between;
  margin-left: 8px;
  font-size: 16px;
`;

const TagWrapper = styled.div`
  width: 400px;
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

const CheckboxWrapper = styled.div`
  display: inline-block;
  margin-top: 16px;
  cursor: pointer;
  margin-left: 8px;
`;

const CheckboxLabel = styled.span`
  margin-left: 5px;
`;

const ReloadButton = styled(Button)``;

function ResourceDiffSectionNameDisplay() {
  const dispatch = useAppDispatch();
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);

  const areAllMatchesSelected = useAppSelector(
    state =>
      state.main.clusterDiff.selectedMatches.length === state.main.clusterDiff.clusterToLocalResourcesMatches.length
  );

  const onClickReload = () => {
    dispatch(loadClusterDiff());
  };

  const onClickExitPreview = () => {
    stopPreview(dispatch);
  };

  const onClickSelectAll = () => {
    if (areAllMatchesSelected) {
      dispatch(unselectAllClusterDiffMatches());
    } else {
      dispatch(selectAllClusterDiffMatches());
    }
  };

  return (
    <NameDisplayContainer>
      <TagsContainer>
        <TagWrapper>
          <StyledTitle>Local Resources</StyledTitle>
          {isInPreviewMode && (
            <Button type="primary" ghost onClick={onClickExitPreview} style={{marginRight: 8}}>
              Exit preview
            </Button>
          )}
          <PreviewDropdown btnStyle={{maxWidth: '285px'}} />
        </TagWrapper>
        <Spacing />
        <TagWrapper style={{paddingLeft: 45}}>
          <StyledTitle>Cluster Resources</StyledTitle>
          <ReloadButton icon={<ReloadOutlined />} onClick={onClickReload} type="primary" ghost>
            Reload
          </ReloadButton>
        </TagWrapper>
      </TagsContainer>
      <CheckboxWrapper onClick={onClickSelectAll}>
        <Checkbox checked={areAllMatchesSelected} />
        <CheckboxLabel>{areAllMatchesSelected ? 'Deselect all' : 'Select all'}</CheckboxLabel>
      </CheckboxWrapper>
    </NameDisplayContainer>
  );
}

export default ResourceDiffSectionNameDisplay;
