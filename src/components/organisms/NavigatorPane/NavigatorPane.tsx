import React, {useCallback, useContext} from 'react';
import AppContext from '@src/AppContext';
import {K8sResource} from '@models/k8sresource';
import {HelmValuesFile} from '@models/helm';
import KustomizationNavSection, {KustomizationNavSectionScope} from '@src/navsections/KustomizationNavSection';
import HelmChartNavSection, {HelmChartNavSectionScope} from '@src/navsections/HelmChartNavSection';
import K8sResourceNavSection, {K8sResourceNavSectionScope} from '@src/navsections/K8sResourceNavSection';
import {Popover} from 'antd';
import {PlusOutlined, FilterOutlined} from '@ant-design/icons';
import ResourceFilter from '@components/molecules/ResourceFilter';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {NAVIGATOR_HEIGHT_OFFSET, ROOT_FILE_ENTRY} from '@constants/constants';
import {useSelector} from 'react-redux';
import {isInClusterModeSelector, isInPreviewModeSelector} from '@redux/selectors';
import {openNewResourceWizard} from '@redux/reducers/ui';
import {MonoPaneTitle} from '@components/atoms';
import NavSectionRenderer from './NavSectionRenderer';
import * as S from './NavigatorPane.styled';

const NavPane = () => {
  const dispatch = useAppDispatch();
  const {windowSize} = useContext(AppContext);
  const windowHeight = windowSize.height;
  const navigatorHeight = windowHeight - NAVIGATOR_HEIGHT_OFFSET;

  const fileMap = useAppSelector(state => state.main.fileMap);
  const isInClusterMode = useSelector(isInClusterModeSelector);
  const isInPreviewMode = useSelector(isInPreviewModeSelector);

  const doesRootFileEntryExist = useCallback(() => {
    return Boolean(fileMap[ROOT_FILE_ENTRY]);
  }, [fileMap]);

  const onClickNewResource = () => {
    dispatch(openNewResourceWizard());
  };

  return (
    <>
      <S.TitleBar>
        <MonoPaneTitle>Navigator</MonoPaneTitle>
        <S.TitleBarRightButtons>
          <S.PlusButton
            disabled={!doesRootFileEntryExist() || isInClusterMode || isInPreviewMode}
            onClick={onClickNewResource}
            type="link"
            size="small"
            icon={<PlusOutlined />}
          />
          <Popover content={<ResourceFilter />} trigger="click">
            <S.FilterButton
              disabled={!doesRootFileEntryExist() && !isInClusterMode && !isInPreviewMode}
              type="link"
              size="small"
              icon={<FilterOutlined />}
            />
          </Popover>
        </S.TitleBarRightButtons>
      </S.TitleBar>
      <S.List height={navigatorHeight}>
        <NavSectionRenderer<HelmValuesFile, HelmChartNavSectionScope>
          navSection={HelmChartNavSection}
          level={0}
          isLastSection={false}
          onVisible={() => {}}
          onHidden={() => {}}
        />
        <NavSectionRenderer<K8sResource, KustomizationNavSectionScope>
          navSection={KustomizationNavSection}
          level={0}
          isLastSection={false}
          onVisible={() => {}}
          onHidden={() => {}}
        />
        <NavSectionRenderer<K8sResource, K8sResourceNavSectionScope>
          navSection={K8sResourceNavSection}
          level={0}
          isLastSection={false}
          onVisible={() => {}}
          onHidden={() => {}}
        />
      </S.List>
    </>
  );
};

export default NavPane;
