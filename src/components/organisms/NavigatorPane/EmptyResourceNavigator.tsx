import styled from 'styled-components';

import {kubeConfigContextSelector, kubeConfigPathValidSelector} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateResourceFilter} from '@redux/reducers/main';
import {highlightItem, openNewResourceWizard, openTemplateExplorer, setLeftMenuSelection} from '@redux/reducers/ui';
import {activeResourceCountSelector} from '@redux/selectors/resourceMapSelectors';
import {startClusterConnection} from '@redux/thunks/cluster';

import {ResourceFilterType} from '@shared/models/appState';
import {HighlightItems} from '@shared/models/ui';
import {Colors} from '@shared/styles/colors';

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

function EmptyResourceNavigator() {
  const dispatch = useAppDispatch();
  const {lastNamespaceLoaded} = useAppSelector(state => state.main.clusterConnectionOptions);
  const hasAnyActiveResources = useAppSelector(state => activeResourceCountSelector(state) > 0);
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);

  function resetFilters() {
    const emptyFilter: ResourceFilterType = {annotations: {}, labels: {}};
    dispatch(updateResourceFilter(emptyFilter));
  }

  const handleClick = (itemToHighlight: string) => {
    dispatch(highlightItem(itemToHighlight));

    if (itemToHighlight === HighlightItems.BROWSE_TEMPLATES) {
      dispatch(openTemplateExplorer());
    } else if (itemToHighlight === HighlightItems.CREATE_RESOURCE) {
      dispatch(openNewResourceWizard());
    } else if (itemToHighlight === HighlightItems.CONNECT_TO_CLUSTER) {
      dispatch(startClusterConnection({context: kubeConfigContext, namespace: lastNamespaceLoaded || 'default'}));
    }

    setTimeout(() => {
      dispatch(highlightItem(null));
    }, 3000);
  };

  const handleClusterConfigure = () => {
    dispatch(highlightItem(HighlightItems.CLUSTER_PANE_ICON));
    dispatch(setLeftMenuSelection('settings'));
    setTimeout(() => {
      dispatch(highlightItem(null));
    }, 3000);
  };

  return (
    <div style={{padding: 16}}>
      {!hasAnyActiveResources ? (
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
        <p>
          No resources match the active filters. <a onClick={resetFilters}>[Reset Filters]</a>
        </p>
      )}
    </div>
  );
}

export default EmptyResourceNavigator;
