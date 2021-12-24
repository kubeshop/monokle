import React, {useMemo} from 'react';

import {Button, Checkbox, Switch} from 'antd';

import {ReloadOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  reloadClusterDiff,
  selectMultipleClusterDiffMatches,
  toggleClusterOnlyResourcesInClusterDiff,
  unselectAllClusterDiffMatches,
} from '@redux/reducers/main';
import {isInPreviewModeSelector} from '@redux/selectors';
import {stopPreview} from '@redux/services/preview';
import {loadClusterDiff} from '@redux/thunks/loadClusterDiff';

import {PreviewDropdown} from '@components/molecules';

import {CLUSTER_DIFF_SECTION_NAME} from './ClusterDiffSectionBlueprint';

const NameDisplayContainer = styled.div`
  width: 100%;
  margin-left: 16px;
  padding-top: 8px;
  padding-bottom: 8px;
  margin-right: 18px;
`;

const TitlesRow = styled.div`
  display: grid;
  grid-template-columns: 1fr max-content 1fr;
  grid-column-gap: 50px;
  margin-left: 8px;
  font-size: 16px;
`;

const TitleContainer = styled.div``;

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

const SwitchContainer = styled.span`
  margin-left: 8px;
  cursor: pointer;
`;

const SwitchLabel = styled.span`
  margin-left: 4px;
`;

function ResourceDiffSectionNameDisplay() {
  const dispatch = useAppDispatch();
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const hideClusterOnlyResources = useAppSelector(state => state.main.clusterDiff.hideClusterOnlyResources);
  // TODO: we should use the new makeCheckable handler from SectionBlueprint to implement the checkboxes in cluster diff
  const clusterDiffSectionInstance = useAppSelector(
    state => state.navigator.sectionInstanceMap[CLUSTER_DIFF_SECTION_NAME]
  );
  const selectedMatchesLength = useAppSelector(state => state.main.clusterDiff.selectedMatches.length);
  const areAllMatchesSelected = useMemo(
    () => selectedMatchesLength === clusterDiffSectionInstance?.visibleItemIds.length,
    [selectedMatchesLength, clusterDiffSectionInstance?.visibleItemIds.length]
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
      dispatch(selectMultipleClusterDiffMatches(clusterDiffSectionInstance?.visibleItemIds || []));
    }
  };

  const onClickShowAllClusterResources = () => {
    dispatch(toggleClusterOnlyResourcesInClusterDiff());
    dispatch(reloadClusterDiff());
  };

  if (!clusterDiffSectionInstance) {
    return null;
  }

  return (
    <NameDisplayContainer>
      <TitlesRow>
        <TitleContainer>
          <StyledTitle>Local Resources</StyledTitle>
          {isInPreviewMode && (
            <Button type="primary" ghost onClick={onClickExitPreview} style={{marginRight: 8}}>
              Exit preview
            </Button>
          )}
          <PreviewDropdown btnStyle={{maxWidth: '285px'}} />
        </TitleContainer>

        <Spacing />

        <TitleContainer style={{paddingLeft: 18}}>
          <StyledTitle>Cluster Resources</StyledTitle>
          <ReloadButton icon={<ReloadOutlined />} onClick={onClickReload} type="primary" ghost>
            Reload
          </ReloadButton>
          <SwitchContainer onClick={onClickShowAllClusterResources}>
            <Switch checked={!hideClusterOnlyResources} />
            <SwitchLabel>Show all</SwitchLabel>
          </SwitchContainer>
        </TitleContainer>
      </TitlesRow>

      <CheckboxWrapper onClick={onClickSelectAll}>
        <Checkbox indeterminate={selectedMatchesLength > 0 && !areAllMatchesSelected} checked={areAllMatchesSelected} />
        <CheckboxLabel>{areAllMatchesSelected ? 'Deselect all' : 'Select all'}</CheckboxLabel>
      </CheckboxWrapper>
    </NameDisplayContainer>
  );
}

export default ResourceDiffSectionNameDisplay;
