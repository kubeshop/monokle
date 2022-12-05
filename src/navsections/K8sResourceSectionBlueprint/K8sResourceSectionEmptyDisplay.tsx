import React from 'react';

import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateResourceFilter} from '@redux/reducers/main';
import {highlightItem, openNewResourceWizard, setLeftMenuSelection, toggleSettings} from '@redux/reducers/ui';
import {activeResourcesSelector} from '@redux/selectors';
import {startPreview} from '@redux/services/preview';

import {ResourceFilterType} from '@shared/models/appState';
import {HighlightItems} from '@shared/models/ui';
import {Colors} from '@shared/styles/colors';
import {kubeConfigContextSelector, kubeConfigPathValidSelector} from '@shared/utils/selectors';

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
  const dispatch = useAppDispatch();
  const activeResources = useAppSelector(activeResourcesSelector);
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);

  function resetFilters() {
    const emptyFilter: ResourceFilterType = {annotations: {}, labels: {}};
    dispatch(updateResourceFilter(emptyFilter));
  }

  const handleClick = (itemToHighlight: string) => {
    dispatch(highlightItem(itemToHighlight));

    setTimeout(() => {
      if (itemToHighlight === HighlightItems.BROWSE_TEMPLATES) {
        dispatch(setLeftMenuSelection('templates-pane'));
      } else if (itemToHighlight === HighlightItems.CREATE_RESOURCE) {
        dispatch(openNewResourceWizard());
      } else if (itemToHighlight === HighlightItems.CONNECT_TO_CLUSTER) {
        startPreview(kubeConfigContext, 'cluster', dispatch);
      }
    }, 1000);

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
          <StyledTitle id="get-started-title">Get started:</StyledTitle>
          <StyledLink id="create-resource-link" onClick={() => handleClick(HighlightItems.CREATE_RESOURCE)}>
            Create a resource
          </StyledLink>
          <StyledLink id="browse-template-link" onClick={() => handleClick(HighlightItems.BROWSE_TEMPLATES)}>
            Browse templates
          </StyledLink>
          {isKubeConfigPathValid ? (
            <StyledLink id="connect-to-cluster-link" onClick={() => handleClick(HighlightItems.CONNECT_TO_CLUSTER)}>
              Connect to a cluster
            </StyledLink>
          ) : (
            <StyledLink id="configure-cluster-link" onClick={handleClusterConfigure}>
              Configure a cluster
            </StyledLink>
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
