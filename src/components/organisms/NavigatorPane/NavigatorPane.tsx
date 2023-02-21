import {memo, useCallback, useMemo} from 'react';

import {Dropdown, Tooltip} from 'antd';

import {PlusOutlined} from '@ant-design/icons';

import {TOOLTIP_DELAY} from '@constants/constants';
import {NewResourceTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {toggleResourceFilters} from '@redux/reducers/ui';
import {isInPreviewModeSelectorNew} from '@redux/selectors';

import {CheckedResourcesActionsMenu, ResourceFilter, SectionRenderer} from '@molecules';

import {TitleBarWrapper} from '@components/atoms/StyledComponents/TitleBarWrapper';

import {useNewResourceMenuItems} from '@hooks/menuItemsHooks';
import {usePaneHeight} from '@hooks/usePaneHeight';

import K8sResourceSectionBlueprint from '@src/navsections/K8sResourceSectionBlueprint';
import UnknownResourceSectionBlueprint from '@src/navsections/UnknownResourceSectionBlueprint';

import {ResizableRowsPanel, TitleBar} from '@monokle/components';
import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';

import * as S from './NavigatorPane.styled';
import NavigatorTitle from './NavigatorTitle';

const NavPane: React.FC = () => {
  const dispatch = useAppDispatch();

  const checkedResourceIdentifiers = useAppSelector(state => state.main.checkedResourceIdentifiers);
  const isFolderOpen = useAppSelector(state => Boolean(state.main.fileMap[ROOT_FILE_ENTRY]));
  const highlightedItems = useAppSelector(state => state.ui.highlightedItems);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);
  const isPreviewLoading = useAppSelector(state => state.main.previewOptions.isLoading);
  const isResourceFiltersOpen = useAppSelector(state => state.ui.isResourceFiltersOpen);

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
        layout={{top: isResourceFiltersOpen ? 0.34 : 0.065}}
        splitterStyle={{display: isResourceFiltersOpen ? 'block' : 'none'}}
        top={<ResourceFilter active={isResourceFiltersOpen} onToggle={resourceFilterButtonHandler} />}
        bottom={
          <S.List id="navigator-sections-container">
            <SectionRenderer sectionId={K8sResourceSectionBlueprint.id} level={0} isLastSection={false} />
            <SectionRenderer sectionId={UnknownResourceSectionBlueprint.id} level={0} isLastSection={false} />
          </S.List>
        }
        height={height - 40}
        bottomPaneMaxSize={isResourceFiltersOpen ? height - 400 : height - 100}
        bottomPaneMinSize={500}
      />
    </S.NavigatorPaneContainer>
  );
};

export default memo(NavPane);
