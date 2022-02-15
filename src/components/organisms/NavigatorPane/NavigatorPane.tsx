import {LegacyRef, useMemo} from 'react';
import {ResizableBox} from 'react-resizable';
import {useMeasure} from 'react-use';

import {Badge, Button, Tooltip} from 'antd';

import {FilterOutlined, PlusOutlined} from '@ant-design/icons';

import {ROOT_FILE_ENTRY} from '@constants/constants';
import {NewResourceTooltip, QuickFilterTooltip} from '@constants/tooltips';

import {ResourceFilterType} from '@models/appstate';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openNewResourceWizard, toggleResourceFilters} from '@redux/reducers/ui';
import {activeResourcesSelector, isInClusterModeSelector, isInPreviewModeSelector} from '@redux/selectors';

import {MonoPaneTitle} from '@components/atoms';
import {ResourceFilter, SectionRenderer} from '@components/molecules';
import CheckedResourcesActionsMenu from '@components/molecules/CheckedResourcesActionsMenu';

import {useMainPaneHeight} from '@utils/hooks';

import Colors from '@styles/Colors';

import K8sResourceSectionBlueprint from '@src/navsections/K8sResourceSectionBlueprint';
import UnknownResourceSectionBlueprint from '@src/navsections/UnknownResourceSectionBlueprint';

import ClusterCompareButton from './ClusterCompareButton';
import * as S from './NavigatorPane.styled';
import WarningsAndErrorsDisplay from './WarningsAndErrorsDisplay';

const NavPane: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeResources = useAppSelector(activeResourcesSelector);
  const checkedResourceIds = useAppSelector(state => state.main.checkedResourceIds);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const highlightedItems = useAppSelector(state => state.ui.highlightedItems);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const isPreviewLoading = useAppSelector(state => state.main.previewLoader.isLoading);
  const isResourceFiltersOpen = useAppSelector(state => state.ui.isResourceFiltersOpen);
  const resourceFilters: ResourceFilterType = useAppSelector(state => state.main.resourceFilter);

  const paneHeight = useMainPaneHeight();

  const [filtersContainerRef, {height, width}] = useMeasure<HTMLDivElement>();
  const [navigatorPaneRef, {width: navigatorPaneWidth}] = useMeasure<HTMLDivElement>();

  const appliedFilters = useMemo(
    () =>
      Object.entries(resourceFilters)
        .map(([key, value]) => {
          return {filterName: key, filterValue: value};
        })
        .filter(filter => filter.filterValue && Object.values(filter.filterValue).length),
    [resourceFilters]
  );

  const containerGridTemplateRows = useMemo(() => {
    let gridTemplateRows = 'max-content 1fr';

    if (isResourceFiltersOpen) {
      gridTemplateRows = 'repeat(2, max-content) 1fr';
    }

    return gridTemplateRows;
  }, [isResourceFiltersOpen]);

  const isFolderOpen = useMemo(() => Boolean(fileMap[ROOT_FILE_ENTRY]), [fileMap]);

  const onClickNewResource = () => {
    dispatch(openNewResourceWizard());
  };

  const resourceFilterButtonHandler = () => {
    dispatch(toggleResourceFilters());
  };

  return (
    <S.NavigatorPaneContainer $gridTemplateRows={containerGridTemplateRows} ref={navigatorPaneRef}>
      {checkedResourceIds.length && !isPreviewLoading ? (
        <CheckedResourcesActionsMenu />
      ) : (
        <S.TitleBar>
          <MonoPaneTitle>
            <div style={{display: 'flex', alignItems: 'center'}}>
              Navigator <WarningsAndErrorsDisplay />
            </div>
          </MonoPaneTitle>
          <S.TitleBarRightButtons>
            <Tooltip title={NewResourceTooltip}>
              <S.PlusButton
                id="create-resource-button"
                $disabled={!isFolderOpen || isInPreviewMode}
                $highlighted={highlightedItems.createResource}
                className={highlightedItems.createResource ? 'animated-highlight' : ''}
                disabled={!isFolderOpen || isInPreviewMode}
                icon={<PlusOutlined />}
                size="small"
                type="link"
                onClick={onClickNewResource}
              />
            </Tooltip>

            <Tooltip title={QuickFilterTooltip}>
              <Badge count={appliedFilters.length} size="small" offset={[-2, 2]} color={Colors.greenOkay}>
                <Button
                  disabled={(!isFolderOpen && !isInClusterMode && !isInPreviewMode) || activeResources.length === 0}
                  type="link"
                  size="small"
                  icon={<FilterOutlined style={appliedFilters.length ? {color: Colors.greenOkay} : {}} />}
                  onClick={resourceFilterButtonHandler}
                />
              </Badge>
            </Tooltip>

            <ClusterCompareButton navigatorPaneWidth={navigatorPaneWidth} />
          </S.TitleBarRightButtons>
        </S.TitleBar>
      )}

      {isResourceFiltersOpen && (
        <S.FiltersContainer ref={filtersContainerRef}>
          <ResizableBox
            width={width}
            height={height || 350}
            axis="y"
            resizeHandles={['s']}
            minConstraints={[100, 200]}
            maxConstraints={[width, paneHeight - 300]}
            handle={(h: number, ref: LegacyRef<HTMLSpanElement>) => <span className="custom-handle" ref={ref} />}
          >
            <ResourceFilter />
          </ResizableBox>
        </S.FiltersContainer>
      )}

      <S.List id="navigator-sections-container">
        <SectionRenderer sectionBlueprint={K8sResourceSectionBlueprint} level={0} isLastSection={false} />
        <SectionRenderer sectionBlueprint={UnknownResourceSectionBlueprint} level={0} isLastSection={false} />
      </S.List>
    </S.NavigatorPaneContainer>
  );
};

export default NavPane;
