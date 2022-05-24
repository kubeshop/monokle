/* eslint-disable no-restricted-syntax */
import {v5 as uuid} from 'uuid';

import {K8sResource} from '@models/k8sresource';

import {CompareOperation, ResourceComparison} from '@redux/reducers/compare';

const UUID_V5_NAMESPACE = 'c106a26a-21bb-5538-8bf2-74095d1976c1';

export type CompareOptions = {
  operation: CompareOperation;
  defaultNamespace?: string;
};

export function compareResources(
  left: K8sResource[],
  right: K8sResource[],
  options: CompareOptions
): ResourceComparison[] {
  const {operation} = options;
  const leftMap = createHashMap(left, options.defaultNamespace);
  const rightMap = createHashMap(right, options.defaultNamespace);

  switch (operation) {
    case 'union':
      return compareResourcesAsUnion(leftMap, rightMap);
    case 'intersection':
      return compareResourcesAsIntersection(leftMap, rightMap);
    case 'symmetricDifference':
      return compareResourcesAsSymmetricDifference(leftMap, rightMap);
    case 'leftJoin':
      return compareResourcesAsLeftJoin(leftMap, rightMap);
    case 'rightJoin':
      return compareResourcesAsRightJoin(leftMap, rightMap);
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
        isDifferent: leftResource.text !== matchingRightResource.text,
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

function compareResourcesAsIntersection(
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
    }
  }

  return result;
}

function compareResourcesAsSymmetricDifference(
  leftMap: Map<string, K8sResource>,
  rightMap: Map<string, K8sResource>
): ResourceComparison[] {
  const result: ResourceComparison[] = [];

  for (const [id, leftResource] of leftMap.entries()) {
    const matchingRightResource = rightMap.get(id);

    if (!matchingRightResource) {
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

    if (!matchingLeftResource) {
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

function compareResourcesAsLeftJoin(
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

  return result;
}

function compareResourcesAsRightJoin(
  leftMap: Map<string, K8sResource>,
  rightMap: Map<string, K8sResource>
): ResourceComparison[] {
  const result: ResourceComparison[] = [];

  for (const [id, rightResource] of rightMap.entries()) {
    const matchingLeftResource = leftMap.get(id);

    if (matchingLeftResource) {
      result.push({
        id: createStableComparisonIdentifier(matchingLeftResource, rightResource),
        isMatch: true,
        isDifferent: matchingLeftResource.text === rightResource.text,
        left: matchingLeftResource,
        right: rightResource,
      });
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

function createHashMap(resources: K8sResource[], defaultNamespace?: string): Map<string, K8sResource> {
  const result = new Map();

  for (const resource of resources) {
    const id = createFullResourceIdentifier(resource, defaultNamespace);
    result.set(id, resource);
  }

  return result;
}

function createFullResourceIdentifier(resource: K8sResource, defaultNamespace?: string): string {
  return `${resource.name}.${resource.kind}.${resource.namespace ?? defaultNamespace ?? 'default'}.${resource.version}`;
}

function createStableComparisonIdentifier(left: K8sResource | undefined, right: K8sResource | undefined): string {
  const id = [
    left ? createFullResourceIdentifier(left) : 'unknown',
    '-',
    right ? createFullResourceIdentifier(right) : 'unknown',
  ].join();

  return uuid(id, UUID_V5_NAMESPACE);
}
