import React, {useMemo} from 'react';

import {Badge} from 'antd';

import {FilterOutlined} from '@ant-design/icons';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {useAppSelector} from '@redux/hooks';
import {activeResourcesSelector, isInClusterModeSelector} from '@redux/selectors';

import {IconWithPopover} from '@atoms';

import {ResourceFilterType} from '@monokle-desktop/shared/models';
import {Colors} from '@monokle-desktop/shared/styles/colors';
import {isInPreviewModeSelector} from '@monokle-desktop/shared/utils/selectors';

import ResourceFilter from '../ResourceFilter';

const ResourceFilterIconWithPopover: React.FC = () => {
  const activeResources = useAppSelector(activeResourcesSelector);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const resourceFilters: ResourceFilterType = useAppSelector(state => state.main.resourceFilter);

  const appliedFilters = useMemo(() => {
    return Object.entries(resourceFilters)
      .map(([key, value]) => {
        return {filterName: key, filterValue: value};
      })
      .filter(filter => filter.filterValue && Object.values(filter.filterValue).length);
  }, [resourceFilters]);

  const doesRootFileEntryExist = useMemo(() => Boolean(fileMap[ROOT_FILE_ENTRY]), [fileMap]);

  return (
    <Badge count={appliedFilters.length} size="small" offset={[-2, 2]} color={Colors.greenOkay}>
      <IconWithPopover
        popoverContent={<ResourceFilter />}
        popoverTrigger="click"
        iconComponent={<FilterOutlined style={appliedFilters.length ? {color: Colors.greenOkay} : {}} />}
        isDisabled={(!doesRootFileEntryExist && !isInClusterMode && !isInPreviewMode) || activeResources.length === 0}
      />
    </Badge>
  );
};

export default ResourceFilterIconWithPopover;
