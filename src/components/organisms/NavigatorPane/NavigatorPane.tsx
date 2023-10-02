import {useCallback} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {toggleResourceFilters} from '@redux/reducers/ui';

import {CheckedResourcesActionsMenu, ResourceFilter} from '@molecules';

import {isInPreviewModeSelector} from '@shared/utils';

import DryRunTitleBar from './DryRunTitleBar';
import ResourceNavigator from './ResourceNavigator';
import {ResourceTitleBar} from './ResourceTitleBar';

import * as S from './styled';

const NavPane: React.FC = () => {
  const dispatch = useAppDispatch();

  const checkedResourceIdentifiers = useAppSelector(state => state.main.checkedResourceIdentifiers);

  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const isPreviewLoading = useAppSelector(state => state.main.previewOptions.isLoading);
  const isResourceFiltersOpen = useAppSelector(state => state.ui.isResourceFiltersOpen);

  const resourceFilterButtonHandler = useCallback(() => {
    dispatch(toggleResourceFilters());
  }, [dispatch]);

  return (
    <S.NavigatorPaneContainer>
      {checkedResourceIdentifiers.length && !isPreviewLoading ? (
        <S.SelectionBar>
          <CheckedResourcesActionsMenu />
        </S.SelectionBar>
      ) : isInPreviewMode ? (
        <DryRunTitleBar />
      ) : (
        <ResourceTitleBar />
      )}

      <ResourceFilter active={isResourceFiltersOpen} onToggle={resourceFilterButtonHandler} />

      <S.List id="navigator-sections-container">
        <ResourceNavigator />
      </S.List>
    </S.NavigatorPaneContainer>
  );
};

export default NavPane;
