import React from 'react';

import {useAppSelector} from '@redux/hooks';
import {activeResourcesSelector} from '@redux/selectors';

function K8sResourceSectionEmptyDisplay() {
  const activeResources = useAppSelector(activeResourcesSelector);

  return (
    <>
      <h1>K8s Resources</h1>
      {activeResources.length === 0 ? (
        <p>No resources found in the current folder.</p>
      ) : (
        <p>No resources match the active filters.</p>
      )}
    </>
  );
}

export default K8sResourceSectionEmptyDisplay;
