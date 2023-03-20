import {useCallback, useMemo} from 'react';
import {useMeasure} from 'react-use';

import {Dropdown, Tooltip} from 'antd';

import {PlusOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {TOOLTIP_DELAY} from '@constants/constants';
import {NewResourceTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {collapseResourceKinds, expandResourceKinds, toggleResourceFilters} from '@redux/reducers/ui';
import {isInPreviewModeSelectorNew} from '@redux/selectors';
import {resourceKindsSelector} from '@redux/selectors/resourceMapSelectors';

import {CheckedResourcesActionsMenu, ResourceFilter} from '@molecules';

import {TitleBarWrapper} from '@components/atoms/StyledComponents/TitleBarWrapper';

import {useNewResourceMenuItems} from '@hooks/menuItemsHooks';
import {usePaneHeight} from '@hooks/usePaneHeight';

import {Icon, ResizableRowsPanel, TitleBar} from '@monokle/components';
import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {Colors} from '@shared/styles';

import * as S from './NavigatorPane.styled';
import NavigatorTitle from './NavigatorTitle';
import ResourceNavigator from './ResourceNavigator';

const NavPane: React.FC = () => {
  const dispatch = useAppDispatch();

  const checkedResourceIdentifiers = useAppSelector(state => state.main.checkedResourceIdentifiers);
  const isFolderOpen = useAppSelector(state => Boolean(state.main.fileMap[ROOT_FILE_ENTRY]));
  const highlightedItems = useAppSelector(state => state.ui.highlightedItems);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);
  const isPreviewLoading = useAppSelector(state => state.main.previewOptions.isLoading);
  const isResourceFiltersOpen = useAppSelector(state => state.ui.isResourceFiltersOpen);

  const [resourceFilterRef, {height: resourceFilterHeight}] = useMeasure<HTMLDivElement>();

  const height = usePaneHeight();
  const newResourceMenuItems = useNewResourceMenuItems();

  const resourceFilterButtonHandler = useCallback(() => {
    dispatch(toggleResourceFilters());
  }, [dispatch]);

  const isHighlighted = useMemo(
    () => Boolean(highlightedItems.createResource || highlightedItems.browseTemplates),
    [highlightedItems.browseTemplates, highlightedItems.createResource]
  );

  return (
    <S.NavigatorPaneContainer>
      {checkedResourceIdentifiers.length && !isPreviewLoading ? (
        <S.SelectionBar>
          <CheckedResourcesActionsMenu />
        </S.SelectionBar>
      ) : (
        <TitleBarWrapper>
          <TitleBar
            type="secondary"
            title={<NavigatorTitle />}
            actions={
              <S.TitleBarRightButtons>
                <CollapseAction />
                <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={NewResourceTooltip}>
                  <Dropdown
                    trigger={['click']}
                    menu={{items: newResourceMenuItems}}
                    overlayClassName="dropdown-secondary"
                  >
                    <S.PlusButton
                      id="create-resource-button"
                      $disabled={!isFolderOpen || isInPreviewMode}
                      $highlighted={isHighlighted}
                      className={isHighlighted ? 'animated-highlight' : ''}
                      disabled={!isFolderOpen || isInPreviewMode}
                      icon={<PlusOutlined />}
                      size="small"
                      type="link"
                    />
                  </Dropdown>
                </Tooltip>
              </S.TitleBarRightButtons>
            }
          />
        </TitleBarWrapper>
      )}

      <ResizableRowsPanel
        layout={{top: isResourceFiltersOpen ? 0.34 : resourceFilterHeight / height + (height < 800 ? 0.014 : 0.004)}}
        splitterStyle={{display: isResourceFiltersOpen ? 'block' : 'none'}}
        top={
          <div ref={resourceFilterRef}>
            <ResourceFilter active={isResourceFiltersOpen} onToggle={resourceFilterButtonHandler} />
          </div>
        }
        bottom={
          <S.List id="navigator-sections-container">
            <ResourceNavigator />
          </S.List>
        }
        height={height - 40}
        bottomPaneMaxSize={isResourceFiltersOpen ? height - (height < 1000 ? 200 : 400) : height - 100}
        bottomPaneMinSize={500}
      />
    </S.NavigatorPaneContainer>
  );
};

export default NavPane;

function CollapseAction() {
  const dispatch = useAppDispatch();
  const allKinds = useAppSelector(resourceKindsSelector);
  const collapsedKinds = useAppSelector(s => s.ui.navigator.collapsedResourceKinds);

  const onClick = useCallback(() => {
    if (collapsedKinds.length === allKinds.length) {
      dispatch(expandResourceKinds(allKinds));
      return;
    }
    dispatch(collapseResourceKinds(allKinds));
  }, [dispatch, collapsedKinds, allKinds]);

  return (
    <CollapseIconWrapper onClick={onClick}>
      <Icon name="collapse" />
    </CollapseIconWrapper>
  );
}

const CollapseIconWrapper = styled.div`
  color: ${Colors.blue6};
  cursor: pointer;
  padding-right: 8px;
`;
