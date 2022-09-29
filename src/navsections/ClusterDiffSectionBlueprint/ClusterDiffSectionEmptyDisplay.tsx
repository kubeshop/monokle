import React from 'react';

import useResourceFilter from '@hooks/resourcesHooks/useResoucreFilter';

function ClusterDiffSectionEmptyDisplay() {
  const {appliedFilters} = useResourceFilter();

  if (appliedFilters.length === 0) {
    return null;
  }

  return <p>No resources match the active filters.</p>;
}

export default ClusterDiffSectionEmptyDisplay;
