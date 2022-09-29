import {useMemo} from 'react';

import {FileMapType} from '@models/appstate';
import {K8sResource} from '@models/k8sresource';

import {useAppSelector} from '@redux/hooks';

import {isResourcePassingFilter} from '@utils/resources';

const useResourceFilter = () => {
  const resourceFilter = useAppSelector(state => state.main.resourceFilter);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const fileMapAllFiles = useAppSelector(state => state.main.fileMap);

  const filteredResources = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(resourceMap).filter(([, resource]) => isResourcePassingFilter(resource, resourceFilter))
      ),
    [resourceFilter, resourceMap]
  );

  const appliedFilters = useMemo(
    () =>
      Object.entries(resourceFilter)
        .map(([key, value]) => {
          return {filterName: key, filterValue: value};
        })
        .filter(filter => filter.filterValue && Object.values(filter.filterValue).length),
    [resourceFilter]
  );

  const fileMapFiltered = useMemo((): FileMapType => {
    if (appliedFilters.length) {
      return Object.values(filteredResources).reduce((prevVal: any, currResource: K8sResource) => {
        return {...prevVal, [currResource.filePath]: fileMapAllFiles[currResource.filePath]};
      }, {});
    }
    return fileMapAllFiles;
  }, [appliedFilters.length, fileMapAllFiles, filteredResources]);

  return {filteredResources, appliedFilters, fileMapFiltered};
};

export default useResourceFilter;
