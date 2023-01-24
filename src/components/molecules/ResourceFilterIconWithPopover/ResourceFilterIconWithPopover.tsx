import React, {useMemo} from 'react';

import {Badge} from 'antd';

import {FilterOutlined} from '@ant-design/icons';

import {useAppSelector} from '@redux/hooks';
import {activeResourceCountSelector, isInClusterModeSelector} from '@redux/selectors';

import {IconWithPopover} from '@atoms';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {ResourceFilterType} from '@shared/models/appState';
import {Colors} from '@shared/styles/colors';
import {isInPreviewModeSelectorNew} from '@shared/utils/selectors';

import ResourceFilter from '../ResourceFilter';

const ResourceFilterIconWithPopover: React.FC = () => {
  const activeResourceCount = useAppSelector(activeResourceCountSelector);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);
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
        isDisabled={(!doesRootFileEntryExist && !isInClusterMode && !isInPreviewMode) || activeResourceCount === 0}
      />
    </Badge>
  );
};

export default ResourceFilterIconWithPopover;
