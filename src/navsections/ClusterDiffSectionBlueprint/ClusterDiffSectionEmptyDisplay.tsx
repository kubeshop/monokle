import React, {useMemo} from 'react';

import {useAppSelector} from '@redux/hooks';

function ClusterDiffSectionEmptyDisplay() {
  const resourceFilter = useAppSelector(state => state.main.resourceFilter);

  const appliedFilters = useMemo(() => {
    return Object.entries(resourceFilter)
      .map(([key, value]) => {
        return {filterName: key, filterValue: value};
      })
      .filter(filter => filter.filterValue && Object.values(filter.filterValue).length);
  }, [resourceFilter]);

  if (appliedFilters.length === 0) {
    return null;
  }

  return <p>No resources match the active filters.</p>;
}

export default ClusterDiffSectionEmptyDisplay;
