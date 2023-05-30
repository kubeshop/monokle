import {useCallback, useMemo} from 'react';

import {Dropdown, Tooltip} from 'antd';

import {FullscreenExitOutlined, FullscreenOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {TOOLTIP_DELAY} from '@constants/constants';
import {
  CollapseResourcesTooltip,
  DisabledAddResourceTooltip,
  ExpandResourcesTooltip,
  NewResourceTooltip,
} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {collapseResourceKinds, expandResourceKinds, toggleResourceFilters} from '@redux/reducers/ui';
import {navigatorResourceKindsSelector} from '@redux/selectors/resourceMapSelectors';

import {CheckedResourcesActionsMenu, ResourceFilter} from '@molecules';

import {TitleBarWrapper} from '@components/atoms/StyledComponents/TitleBarWrapper';

import {useNewResourceMenuItems} from '@hooks/menuItemsHooks';

import {useSelectorWithRef} from '@utils/hooks';

import {TitleBar} from '@monokle/components';
import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {Colors} from '@shared/styles';
import {trackEvent} from '@shared/utils';
import {isInClusterModeSelector, isInPreviewModeSelector} from '@shared/utils/selectors';

import NavigatorDescription from './NavigatorDescription';
import * as S from './NavigatorPane.styled';
import ResourceNavigator from './ResourceNavigator';

const NavPane: React.FC = () => {
  const dispatch = useAppDispatch();

  const checkedResourceIdentifiers = useAppSelector(state => state.main.checkedResourceIdentifiers);
  const isFolderOpen = useAppSelector(state => Boolean(state.main.fileMap[ROOT_FILE_ENTRY]));
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const isPreviewLoading = useAppSelector(state => state.main.previewOptions.isLoading);
  const isResourceFiltersOpen = useAppSelector(state => state.ui.isResourceFiltersOpen);

  const newResourceMenuItems = useNewResourceMenuItems();

  const isAddResourceDisabled = useMemo(
    () => !isFolderOpen || isInPreviewMode || isInClusterMode,
    [isFolderOpen, isInClusterMode, isInPreviewMode]
  );

  const resourceFilterButtonHandler = useCallback(() => {
    dispatch(toggleResourceFilters());
  }, [dispatch]);

  return (
    <S.NavigatorPaneContainer>
      {checkedResourceIdentifiers.length && !isPreviewLoading ? (
        <S.SelectionBar>
          <CheckedResourcesActionsMenu />
        </S.SelectionBar>
      ) : (
        <TitleBarWrapper $navigator>
          <TitleBar
            type="secondary"
            title="Kubernetes Resources"
            description={<NavigatorDescription />}
            descriptionStyle={{paddingTop: '5px'}}
            actions={
              <S.TitleBarRightButtons>
                <CollapseAction />

                <Dropdown
                  trigger={['click']}
                  menu={{items: newResourceMenuItems}}
                  overlayClassName="dropdown-secondary"
                  disabled={isAddResourceDisabled}
                >
                  <Tooltip
                    mouseEnterDelay={TOOLTIP_DELAY}
                    title={
                      isAddResourceDisabled
                        ? DisabledAddResourceTooltip({
                            type: isInClusterMode ? 'cluster' : isInPreviewMode ? 'preview' : 'other',
                          })
                        : NewResourceTooltip
                    }
                  >
                    <S.NewButton
                      id="create-resource-button"
                      disabled={isAddResourceDisabled}
                      size="small"
                      type="primary"
                    >
                      New
                    </S.NewButton>
                  </Tooltip>
                </Dropdown>
              </S.TitleBarRightButtons>
            }
          />
        </TitleBarWrapper>
      )}

      <ResourceFilter active={isResourceFiltersOpen} onToggle={resourceFilterButtonHandler} />

      <S.List id="navigator-sections-container">
        <ResourceNavigator />
      </S.List>
    </S.NavigatorPaneContainer>
  );
};

export default NavPane;

function CollapseAction() {
  const dispatch = useAppDispatch();

  const [collapsedKinds, collapsedKindsRef] = useSelectorWithRef(s => s.ui.navigator.collapsedResourceKinds);
  const [navigatorKinds, navigatorKindsRef] = useSelectorWithRef(navigatorResourceKindsSelector);

  const isCollapsed = useMemo(
    () => collapsedKinds.length === navigatorKinds.length,
    [collapsedKinds.length, navigatorKinds.length]
  );

  const onClick = useCallback(() => {
    if (collapsedKindsRef.current.length === navigatorKindsRef.current.length) {
      dispatch(expandResourceKinds(navigatorKindsRef.current));
      trackEvent('navigator/expand_all');
      return;
    }

    dispatch(collapseResourceKinds(navigatorKindsRef.current));
    trackEvent('navigator/collapse_all');
  }, [collapsedKindsRef, navigatorKindsRef, dispatch]);

  return (
    <>
      <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={isCollapsed ? ExpandResourcesTooltip : CollapseResourcesTooltip}>
        {isCollapsed ? (
          <StyledFullscreenOutlined onClick={onClick} />
        ) : (
          <StyledFullscreenExitOutlined onClick={onClick} />
        )}
      </Tooltip>
    </>
  );
}

// Styled Components

const StyledFullscreenOutlined = styled(FullscreenOutlined)`
  color: ${Colors.blue6};
  cursor: pointer;
  padding-right: 10px;
  font-size: 16px;
`;

const StyledFullscreenExitOutlined = styled(FullscreenExitOutlined)`
  color: ${Colors.blue6};
  cursor: pointer;
  padding-right: 10px;
  font-size: 16px;
`;
