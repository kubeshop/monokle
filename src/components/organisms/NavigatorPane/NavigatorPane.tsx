import {useMemo} from 'react';
import {ReflexContainer, ReflexElement, ReflexSplitter} from 'react-reflex';

import {Badge, Button, Tooltip} from 'antd';

import {FilterOutlined, PlusOutlined} from '@ant-design/icons';

import {GUTTER_SPLIT_VIEW_PANE_WIDTH, ROOT_FILE_ENTRY} from '@constants/constants';
import {NewResourceTooltip, QuickFilterTooltip} from '@constants/tooltips';

import {ResourceFilterType} from '@models/appstate';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openNewResourceWizard, toggleResourceFilters} from '@redux/reducers/ui';
import {activeResourcesSelector, isInClusterModeSelector, isInPreviewModeSelector} from '@redux/selectors';

import {MonoPaneTitle} from '@components/atoms';
import {ResourceFilter} from '@components/molecules';
import CheckedResourcesActionsMenu from '@components/molecules/CheckedResourcesActionsMenu';
import SectionRenderer from '@components/molecules/SectionRenderer/new_SectionRenderer';

import {FeatureFlag} from '@utils/features';

import Colors from '@styles/Colors';

import K8sResourceSectionBlueprint from '@src/navsections/K8sResourceSectionBlueprint';

import ClusterCompareButton from './ClusterCompareButton';
import {CompareButton} from './CompareButton';
import * as S from './NavigatorPane.styled';
import WarningsAndErrorsDisplay from './WarningsAndErrorsDisplay';

type Props = {
  height: number;
};

const NavPane: React.FC<Props> = ({height}) => {
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

  const onClickNewResource = () => {
    dispatch(openNewResourceWizard());
  };

  const resourceFilterButtonHandler = () => {
    dispatch(toggleResourceFilters());
  };

  return (
    <S.NavigatorPaneContainer>
      {checkedResourceIds.length && !isPreviewLoading ? (
        <S.SelectionBar>
          <CheckedResourcesActionsMenu />
        </S.SelectionBar>
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

            <FeatureFlag name="CompareEverything" fallback={<ClusterCompareButton />}>
              <CompareButton />
            </FeatureFlag>
          </S.TitleBarRightButtons>
        </S.TitleBar>
      )}

      <ReflexContainer orientation="horizontal" style={{height: height - 40}}>
        {isResourceFiltersOpen && (
          <ReflexElement flex={0.4} minSize={100}>
            <ResourceFilter />
          </ReflexElement>
        )}

        {isResourceFiltersOpen && <ReflexSplitter />}

        <ReflexElement minSize={GUTTER_SPLIT_VIEW_PANE_WIDTH}>
          {/* <S.List id="navigator-sections-container"> */}
          <SectionRenderer
            height={height - 40}
            sectionBlueprint={K8sResourceSectionBlueprint}
            level={0}
            isLastSection={false}
          />
          {/* <SectionRenderer  sectionBlueprint={UnknownResourceSectionBlueprint} level={0} isLastSection={false} /> */}
          {/* </S.List> */}
        </ReflexElement>
      </ReflexContainer>
    </S.NavigatorPaneContainer>
  );
};

export default NavPane;
