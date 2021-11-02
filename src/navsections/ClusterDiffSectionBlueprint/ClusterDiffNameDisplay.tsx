import React, {useMemo} from 'react';
import {ItemCustomComponentProps} from '@models/navigator';
import {K8sResource} from '@models/k8sresource';

function ClusterDiffNameDisplay(props: ItemCustomComponentProps) {
  const {itemInstance} = props;
  const {clusterResource, localResources} = (itemInstance.meta || {}) as {
    clusterResource?: K8sResource;
    localResources?: K8sResource[];
  };
  const firstLocalResource = useMemo(() => {
    return localResources && localResources.length > 0 ? localResources[0] : undefined;
  }, [localResources]);
  if (!clusterResource && !localResources) {
    return null;
  }
  return (
    <>
      {clusterResource ? clusterResource.name : 'Not found in cluster'}
      {'<--->'}
      {firstLocalResource ? firstLocalResource.name : 'Not found locally'}
    </>
  );
}

export default ClusterDiffNameDisplay;
