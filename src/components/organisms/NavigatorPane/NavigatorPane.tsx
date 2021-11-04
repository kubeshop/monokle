import {useCallback, useContext, useMemo} from 'react';
import AppContext from '@src/AppContext';
import {K8sResource} from '@models/k8sresource';
import {HelmValuesFile} from '@models/helm';
import Colors from '@styles/Colors';
import IconWithPopover from '@components/molecules/IconWithPopover';
import KustomizationSectionBlueprint, {KustomizationScopeType} from '@src/navsections/KustomizationSectionBlueprint';
import HelmChartSectionBlueprint, {HelmChartScopeType} from '@src/navsections/HelmChartSectionBlueprint';
import K8sResourceSectionBlueprint, {K8sResourceScopeType} from '@src/navsections/K8sResourceSectionBlueprint';
import {PlusOutlined, FilterOutlined} from '@ant-design/icons';
import ResourceFilter from '@components/molecules/ResourceFilter';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {NAVIGATOR_HEIGHT_OFFSET, ROOT_FILE_ENTRY} from '@constants/constants';
import {useSelector} from 'react-redux';
import {isInClusterModeSelector, isInPreviewModeSelector} from '@redux/selectors';
import {openNewResourceWizard} from '@redux/reducers/ui';
import {MonoPaneTitle} from '@components/atoms';
import SectionRenderer from './SectionRenderer';
import WarningsAndErrorsDisplay from './WarningsAndErrorsDisplay';
import * as S from './NavigatorPane.styled';

const NavPane: React.FC = () => {
  const dispatch = useAppDispatch();
  const {windowSize} = useContext(AppContext);
  const windowHeight = windowSize.height;
  const navigatorHeight = windowHeight - NAVIGATOR_HEIGHT_OFFSET;

  const fileMap = useAppSelector(state => state.main.fileMap);
  // TODO: remove this any
  const resourceFilters: any = useAppSelector(state => state.main.resourceFilter);

  const isInClusterMode = useSelector(isInClusterModeSelector);
  const isInPreviewMode = useSelector(isInPreviewModeSelector);

  const appliedFilters = useMemo(() => {
    return Object.keys(resourceFilters)
      .map(filterName => {
        return {filterName, filterValue: resourceFilters[filterName]};
      })
      .filter(filter => filter.filterValue && Object.values(filter.filterValue).length);
  }, [resourceFilters]);

  const doesRootFileEntryExist = useCallback(() => {
    return Boolean(fileMap[ROOT_FILE_ENTRY]);
  }, [fileMap]);

  const onClickNewResource = () => {
    dispatch(openNewResourceWizard());
  };

  return (
    <>
      <S.TitleBar>
        <MonoPaneTitle>
          Navigator <WarningsAndErrorsDisplay />
        </MonoPaneTitle>
        <S.TitleBarRightButtons>
          <S.PlusButton
            disabled={!doesRootFileEntryExist() || isInClusterMode || isInPreviewMode}
            onClick={onClickNewResource}
            type="link"
            size="small"
            icon={<PlusOutlined />}
          />
          <IconWithPopover
            popoverContent={<ResourceFilter />}
            popoverTrigger="click"
            iconComponent={<FilterOutlined style={appliedFilters.length ? {color: Colors.greenOkay} : {}} />}
            isDisabled={!doesRootFileEntryExist() && !isInClusterMode && !isInPreviewMode}
          />
          {appliedFilters.length ? <S.FiltersAmount>{appliedFilters.length} filters applied</S.FiltersAmount> : null}
        </S.TitleBarRightButtons>
      </S.TitleBar>
      <S.List height={navigatorHeight}>
        <SectionRenderer<HelmValuesFile, HelmChartScopeType>
          sectionBlueprint={HelmChartSectionBlueprint}
          level={0}
          isLastSection={false}
        />
        <SectionRenderer<K8sResource, KustomizationScopeType>
          sectionBlueprint={KustomizationSectionBlueprint}
          level={0}
          isLastSection={false}
        />
        <SectionRenderer<K8sResource, K8sResourceScopeType>
          sectionBlueprint={K8sResourceSectionBlueprint}
          level={0}
          isLastSection={false}
        />
      </S.List>
    </>
  );
};

export default NavPane;
