import {LegacyRef, useContext, useMemo} from 'react';
import {useSelector} from 'react-redux';
import {ResizableBox} from 'react-resizable';
import {useMeasure} from 'react-use';

import {Badge, Button} from 'antd';

import {FilterOutlined, PlusOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {NAVIGATOR_HEIGHT_OFFSET, ROOT_FILE_ENTRY} from '@constants/constants';

import {ResourceFilterType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openNewResourceWizard, toggleResourceFilters} from '@redux/reducers/ui';
import {activeResourcesSelector, isInClusterModeSelector, isInPreviewModeSelector} from '@redux/selectors';

import {MonoPaneTitle} from '@components/atoms';
import {ResourceFilter, SectionRenderer} from '@components/molecules';
import CheckedResourcesActionsMenu from '@components/molecules/CheckedResourcesActionsMenu';

import Colors from '@styles/Colors';

import AppContext from '@src/AppContext';
import K8sResourceSectionBlueprint, {K8sResourceScopeType} from '@src/navsections/K8sResourceSectionBlueprint';
import UnknownResourceSectionBlueprint, {
  UnknownResourceScopeType,
} from '@src/navsections/UnknownResourceSectionBlueprint';

import ClusterCompareButton from './ClusterCompareButton';
import * as S from './NavigatorPane.styled';
import WarningsAndErrorsDisplay from './WarningsAndErrorsDisplay';

const FiltersContainer = styled.div`
  position: relative;
  padding: 0px 16px;
  margin-bottom: 10px;

  & .react-resizable {
    padding: 10px 0px;
    overflow-y: auto;
    ::-webkit-scrollbar {
      width: 0;
      background: transparent;
    }
  }

  & .custom-handle {
    position: absolute;
    left: 0;
    right: 0;
    bottom: -8px;
    height: 3px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    cursor: row-resize;
  }
`;

const NavPane: React.FC = () => {
  const dispatch = useAppDispatch();
  const {windowSize} = useContext(AppContext);
  const windowHeight = windowSize.height;
  const navigatorHeight = windowHeight - NAVIGATOR_HEIGHT_OFFSET;

  const [filtersContainerRef, {height, width}] = useMeasure<HTMLDivElement>();

  const fileMap = useAppSelector(state => state.main.fileMap);
  const resourceFilters: ResourceFilterType = useAppSelector(state => state.main.resourceFilter);
  const activeResources = useAppSelector(activeResourcesSelector);

  const checkedResourceIds = useAppSelector(state => state.main.checkedResourceIds);
  const isResourceFiltersOpen = useAppSelector(state => state.ui.isResourceFiltersOpen);

  const isInClusterMode = useSelector(isInClusterModeSelector);
  const isInPreviewMode = useSelector(isInPreviewModeSelector);

  const appliedFilters = useMemo(() => {
    return Object.entries(resourceFilters)
      .map(([key, value]) => {
        return {filterName: key, filterValue: value};
      })
      .filter(filter => filter.filterValue && Object.values(filter.filterValue).length);
  }, [resourceFilters]);

  const isFolderOpen = useMemo(() => {
    return Boolean(fileMap[ROOT_FILE_ENTRY]);
  }, [fileMap]);

  const onClickNewResource = () => {
    dispatch(openNewResourceWizard());
  };

  const resourceFilterButtonHandler = () => {
    dispatch(toggleResourceFilters());
  };

  return (
    <>
      <S.TitleBar>
        <MonoPaneTitle>
          Navigator <WarningsAndErrorsDisplay />
        </MonoPaneTitle>
        <S.TitleBarRightButtons>
          <S.PlusButton
            disabled={!isFolderOpen || isInClusterMode || isInPreviewMode}
            onClick={onClickNewResource}
            type="link"
            size="small"
            icon={<PlusOutlined />}
          />
          <Badge count={appliedFilters.length} size="small" offset={[-2, 2]} color={Colors.greenOkay}>
            <Button
              disabled={(!isFolderOpen && !isInClusterMode && !isInPreviewMode) || activeResources.length === 0}
              type="link"
              size="small"
              icon={<FilterOutlined style={appliedFilters.length ? {color: Colors.greenOkay} : {}} />}
              onClick={resourceFilterButtonHandler}
            />
          </Badge>
          <ClusterCompareButton />
        </S.TitleBarRightButtons>
      </S.TitleBar>

      {isResourceFiltersOpen && (
        <>
          <FiltersContainer ref={filtersContainerRef}>
            <ResizableBox
              width={width}
              height={height || 350}
              axis="y"
              resizeHandles={['s']}
              minConstraints={[100, 200]}
              maxConstraints={[width, navigatorHeight - 200]}
              handle={(h: number, ref: LegacyRef<HTMLSpanElement>) => <span className="custom-handle" ref={ref} />}
            >
              <ResourceFilter />
            </ResizableBox>
          </FiltersContainer>
        </>
      )}

      {checkedResourceIds.length ? <CheckedResourcesActionsMenu /> : null}

      {/* 20 - FiltersContainer padding & 15 - Divider height */}
      <S.List height={navigatorHeight - (isResourceFiltersOpen && height ? height + 20 + 15 : 0)}>
        <SectionRenderer<K8sResource, K8sResourceScopeType>
          sectionBlueprint={K8sResourceSectionBlueprint}
          level={0}
          isLastSection={false}
        />
        <SectionRenderer<K8sResource, UnknownResourceScopeType>
          sectionBlueprint={UnknownResourceSectionBlueprint}
          level={0}
          isLastSection={false}
        />
      </S.List>
    </>
  );
};

export default NavPane;
