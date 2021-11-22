import React, {useCallback, useMemo} from 'react';

import {Badge} from 'antd';

import {FilterOutlined} from '@ant-design/icons';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {ResourceFilterType} from '@models/appstate';

import {useAppSelector} from '@redux/hooks';
import {activeResourcesSelector, isInClusterModeSelector, isInPreviewModeSelector} from '@redux/selectors';

import Colors from '@styles/Colors';

import IconWithPopover from '../IconWithPopover';
import ResourceFilter from '../ResourceFilter';

const ResourceFilterIconWithPopover: React.FC = () => {
  const fileMap = useAppSelector(state => state.main.fileMap);
  const resourceFilters: ResourceFilterType = useAppSelector(state => state.main.resourceFilter);
  const activeResources = useAppSelector(activeResourcesSelector);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);

  const doesRootFileEntryExist = useCallback(() => {
    return Boolean(fileMap[ROOT_FILE_ENTRY]);
  }, [fileMap]);

  const appliedFilters = useMemo(() => {
    return Object.entries(resourceFilters)
      .map(([key, value]) => {
        return {filterName: key, filterValue: value};
      })
      .filter(filter => filter.filterValue && Object.values(filter.filterValue).length);
  }, [resourceFilters]);

  return (
    <Badge count={appliedFilters.length} size="small" offset={[-2, 2]} color={Colors.greenOkay}>
      <IconWithPopover
        popoverContent={<ResourceFilter />}
        popoverTrigger="click"
        iconComponent={<FilterOutlined style={appliedFilters.length ? {color: Colors.greenOkay} : {}} />}
        isDisabled={(!doesRootFileEntryExist() && !isInClusterMode && !isInPreviewMode) || activeResources.length === 0}
      />
    </Badge>
  );
};

export default ResourceFilterIconWithPopover;
