import {useMemo} from 'react';
import {ReflexContainer, ReflexElement, ReflexSplitter} from 'react-reflex';

import {Badge, Button, Dropdown, Tooltip} from 'antd';

import {FilterOutlined, PlusOutlined} from '@ant-design/icons';

import {isEmpty} from 'lodash';

import {GUTTER_SPLIT_VIEW_PANE_WIDTH, TOOLTIP_DELAY} from '@constants/constants';
import {NewResourceTooltip, QuickFilterTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {toggleResourceFilters} from '@redux/reducers/ui';
import {activeResourceMetaMapSelector, isInClusterModeSelector, isInPreviewModeSelectorNew} from '@redux/selectors';

import {CheckedResourcesActionsMenu, ResourceFilter, SectionRenderer} from '@molecules';

import {TitleBarWrapper} from '@components/atoms/StyledComponents/TitleBarWrapper';

import {useNewResourceMenuItems} from '@hooks/menuItemsHooks';
import {usePaneHeight} from '@hooks/usePaneHeight';

import K8sResourceSectionBlueprint from '@src/navsections/K8sResourceSectionBlueprint';
import UnknownResourceSectionBlueprint from '@src/navsections/UnknownResourceSectionBlueprint';

import {TitleBar} from '@monokle/components';
import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {ResourceFilterType} from '@shared/models/appState';
import {Colors} from '@shared/styles/colors';

import * as S from './NavigatorPane.styled';
import OPAValidationStatus from './OPAValidationStatus';
import WarningsAndErrorsDisplay from './WarningsAndErrorsDisplay';

const NavPane: React.FC = () => {
  const dispatch = useAppDispatch();
  const hasAnyActiveResources = useAppSelector(state => !isEmpty(activeResourceMetaMapSelector(state)));

  const checkedResourceIdentifiers = useAppSelector(state => state.main.checkedResourceIdentifiers);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const highlightedItems = useAppSelector(state => state.ui.highlightedItems);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);
  const isPreviewLoading = useAppSelector(state => state.main.previewOptions.isLoading);
  const isResourceFiltersOpen = useAppSelector(state => state.ui.isResourceFiltersOpen);
  const resourceFilters: ResourceFilterType = useAppSelector(state => state.main.resourceFilter);

  const height = usePaneHeight();
  const newResourceMenuItems = useNewResourceMenuItems();

  const appliedFilters = useMemo(
    () =>
      Object.entries(resourceFilters)
        .map(([key, value]) => {
          return {filterName: key, filterValue: value};
        })
        .filter(filter => filter.filterValue && Object.values(filter.filterValue).length),
    [resourceFilters]
  );

  const isFolderOpen = useMemo(() => Boolean(fileMap[ROOT_FILE_ENTRY]), [fileMap]);

  const resourceFilterButtonHandler = () => {
    dispatch(toggleResourceFilters());
  };

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
            title="Resources"
            description={
              <div style={{display: 'flex', alignItems: 'center'}}>
                <WarningsAndErrorsDisplay /> <OPAValidationStatus />
              </div>
            }
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
                      $highlighted={highlightedItems.createResource}
                      className={highlightedItems.createResource ? 'animated-highlight' : ''}
                      disabled={!isFolderOpen || isInPreviewMode}
                      icon={<PlusOutlined />}
                      size="small"
                      type="link"
                    />
                  </Dropdown>
                </Tooltip>

                <Badge count={appliedFilters.length} size="small" offset={[-2, 2]} color={Colors.greenOkay}>
                  <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={QuickFilterTooltip}>
                    <Button
                      disabled={(!isFolderOpen && !isInClusterMode && !isInPreviewMode) || !hasAnyActiveResources}
                      type="link"
                      size="small"
                      icon={<FilterOutlined style={appliedFilters.length ? {color: Colors.greenOkay} : {}} />}
                      onClick={resourceFilterButtonHandler}
                    />
                  </Tooltip>
                </Badge>
              </S.TitleBarRightButtons>
            }
          />
        </TitleBarWrapper>
      )}

      <ReflexContainer orientation="horizontal" style={{height: height - 40}}>
        {isResourceFiltersOpen && (
          <ReflexElement style={{background: Colors.black9}} flex={0.4} minSize={100}>
            <ResourceFilter />
          </ReflexElement>
        )}

        {isResourceFiltersOpen && <ReflexSplitter />}

        <ReflexElement minSize={GUTTER_SPLIT_VIEW_PANE_WIDTH}>
          <S.List id="navigator-sections-container">
            <SectionRenderer sectionBlueprint={K8sResourceSectionBlueprint} level={0} isLastSection={false} />
            <SectionRenderer sectionBlueprint={UnknownResourceSectionBlueprint} level={0} isLastSection={false} />
          </S.List>
        </ReflexElement>
      </ReflexContainer>
    </S.NavigatorPaneContainer>
  );
};

export default NavPane;
