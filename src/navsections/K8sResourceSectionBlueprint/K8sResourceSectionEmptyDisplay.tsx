import React from 'react';

import {ResourceFilterType} from '@models/appstate';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateResourceFilter} from '@redux/reducers/main';
import {activeResourcesSelector} from '@redux/selectors';

function K8sResourceSectionEmptyDisplay() {
  const activeResources = useAppSelector(activeResourcesSelector);
  const dispatch = useAppDispatch();

  function resetFilters() {
    const emptyFilter: ResourceFilterType = {annotations: {}, labels: {}};
    dispatch(updateResourceFilter(emptyFilter));
  }

  return (
    <>
      <h1>K8s Resources</h1>
      {activeResources.length === 0 ? (
        <p>No resources found in the current folder.</p>
      ) : (
        <p>
          No resources match the active filters. <a onClick={resetFilters}>[Reset Filters]</a>{' '}
        </p>
      )}
    </>
  );
}

export default K8sResourceSectionEmptyDisplay;
