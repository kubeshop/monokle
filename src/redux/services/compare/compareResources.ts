/* eslint-disable no-restricted-syntax */
import {v5 as uuid} from 'uuid';

import {K8sResource} from '@models/k8sresource';

import {CompareOperation, ResourceComparison} from '@redux/reducers/compare';

const UUID_V5_NAMESPACE = 'c106a26a-21bb-5538-8bf2-74095d1976c1';

export type CompareOptions = {
  operation: CompareOperation;
};

export function compareResources(
  left: K8sResource[],
  right: K8sResource[],
  options: CompareOptions
): ResourceComparison[] {
  const {operation} = options;
  const leftMap = createHashMap(left);
  const rightMap = createHashMap(right);

  switch (operation) {
    case 'union':
      return compareResourcesAsUnion(leftMap, rightMap);
    default:
      throw new Error(`${operation} is not yet implemented`);
  }
}

function compareResourcesAsUnion(
  leftMap: Map<string, K8sResource>,
  rightMap: Map<string, K8sResource>
): ResourceComparison[] {
  const result: ResourceComparison[] = [];

  for (const [id, leftResource] of leftMap.entries()) {
    const matchingRightResource = rightMap.get(id);

    if (matchingRightResource) {
      result.push({
        id: createStableComparisonIdentifier(leftResource, matchingRightResource),
        isMatch: true,
        isDifferent: leftResource.text === matchingRightResource.text,
        left: leftResource,
        right: matchingRightResource,
      });
    } else {
      result.push({
        id: createStableComparisonIdentifier(leftResource, matchingRightResource),
        isMatch: false,
        left: leftResource,
        right: undefined,
      });
    }
  }

  for (const [id, rightResource] of rightMap.entries()) {
    const matchingLeftResource = leftMap.get(id);

    if (matchingLeftResource) {
      // eslint-disable-next-line no-continue
      continue; // already had these in previous loop.
    } else {
      result.push({
        id: createStableComparisonIdentifier(matchingLeftResource, rightResource),
        isMatch: false,
        left: undefined,
        right: rightResource,
      });
    }
  }

  return result;
}

function createHashMap(resources: K8sResource[]): Map<string, K8sResource> {
  const result = new Map();

  for (const resource of resources) {
    const id = createFullResourceIdentifier(resource);
    result.set(id, resource);
  }

  return result;
}

function createFullResourceIdentifier(resource: K8sResource): string {
  return `${resource.name}.${resource.kind}.${resource.namespace ?? 'default'}.${resource.version}`;
}

function createStableComparisonIdentifier(left: K8sResource | undefined, right: K8sResource | undefined): string {
  const id = [
    left ? createFullResourceIdentifier(left) : 'unknown',
    '-',
    right ? createFullResourceIdentifier(right) : 'unknown',
  ].join();

  return uuid(id, UUID_V5_NAMESPACE);
}
