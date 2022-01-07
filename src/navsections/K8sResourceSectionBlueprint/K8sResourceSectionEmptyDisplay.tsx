import React from 'react';

import styled from 'styled-components';

import {ResourceFilterType} from '@models/appstate';
import {HighlightItems} from '@models/ui';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateResourceFilter} from '@redux/reducers/main';
import {highlightItem, toggleSettings} from '@redux/reducers/ui';
import {activeResourcesSelector} from '@redux/selectors';

import Colors from '@styles/Colors';

const StyledContainer = styled.div`
  margin-top: 12px;
`;

const StyledTitle = styled.div`
  color: ${Colors.grey7};
  margin-bottom: 4px;
`;

const StyledLink = styled.div`
  color: ${Colors.blue6};
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

function K8sResourceSectionEmptyDisplay() {
  const activeResources = useAppSelector(activeResourcesSelector);
  const dispatch = useAppDispatch();
  const isKubeconfigPathValid = useAppSelector(state => state.config.isKubeconfigPathValid);

  function resetFilters() {
    const emptyFilter: ResourceFilterType = {annotations: {}, labels: {}};
    dispatch(updateResourceFilter(emptyFilter));
  }

  const handleClick = (itemToHighlight: string) => {
    dispatch(highlightItem(itemToHighlight));
    setTimeout(() => {
      dispatch(highlightItem(null));
    }, 3000);
  };

  const handleClusterConfigure = () => {
    dispatch(highlightItem(HighlightItems.CLUSTER_PANE_ICON));
    dispatch(toggleSettings());
    setTimeout(() => {
      dispatch(highlightItem(null));
    }, 3000);
  };

  return (
    <>
      {activeResources.length === 0 ? (
        <StyledContainer>
          <StyledTitle>Get started:</StyledTitle>
          <StyledLink onClick={() => handleClick(HighlightItems.CREATE_RESOURCE)}>Create a resource</StyledLink>
          <StyledLink onClick={() => handleClick(HighlightItems.BROWSE_TEMPLATES)}>Browse templates</StyledLink>
          {isKubeconfigPathValid ? (
            <StyledLink onClick={() => handleClick(HighlightItems.CONNECT_TO_CLUSTER)}>Connect to a cluster</StyledLink>
          ) : (
            <StyledLink onClick={handleClusterConfigure}>Configure a cluster</StyledLink>
          )}
        </StyledContainer>
      ) : (
        <>
          <h1>K8s Resources</h1>
          <p>
            No resources match the active filters. <a onClick={resetFilters}>[Reset Filters]</a>
          </p>
        </>
      )}
    </>
  );
}

export default K8sResourceSectionEmptyDisplay;
