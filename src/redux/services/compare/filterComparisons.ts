import {getResourceKindHandler} from '@src/kindhandlers';

import {CompareFilter, ResourceComparison} from '@shared/models/compare';
import {K8sResource} from '@shared/models/k8sResource';
import {isPassingKeyValueFilter} from '@shared/utils/filter';

type FilterOptions = {
  search?: string;
} & CompareFilter;

type ComparisonFilter = (value: ResourceComparison) => boolean;

export function filterComparisons(allComparisons: ResourceComparison[], filters: ComparisonFilter[]) {
  return filters.reduce((comparison, filter) => comparison.filter(filter), allComparisons);
}

export function createResourceFilters(options: FilterOptions) {
  const filters: ComparisonFilter[] = [];

  if (options.search) {
    filters.push(comparison => {
      const name = getResource(comparison).name;
      return name.toLowerCase().includes(options.search?.toLowerCase() ?? '');
    });
  }

  if (options.namespace) {
    filters.push(comparison => {
      const resource = getResource(comparison);
      const isNamespaced = getResourceKindHandler(resource.kind)?.isNamespaced ?? true;
      if (!isNamespaced) return false;
      const namespace = resource.namespace ?? 'default';
      return namespace.toLowerCase().includes(options.namespace?.toLowerCase() ?? '');
    });
  }

  if (options.kind) {
    filters.push(comparison => {
      const kind = getResource(comparison).kind;
      return kind.toLowerCase().includes(options.kind?.toLowerCase() ?? '');
    });
  }

  if (options.labels && Object.keys(options.labels).length > 0) {
    filters.push(comparison => {
      const labels = getResource(comparison).content?.metadata?.labels;
      const labelsPass = isPassingKeyValueFilter(labels, options.labels!);
      if (labelsPass) return true;

      const templateLabels = getResource(comparison).content?.spec?.template?.metadata?.labels;
      const templateLabelsPass = isPassingKeyValueFilter(templateLabels, options.labels!);
      return templateLabelsPass;
    });
  }

  if (options.annotations && Object.keys(options.annotations).length > 0) {
    filters.push(comparison => {
      const annotations = getResource(comparison).content?.metadata?.annotations;
      return isPassingKeyValueFilter(annotations, options.annotations!);
    });
  }

  return filters;
}

function getResource(comparison: ResourceComparison): K8sResource {
  return comparison.isMatch || comparison.left ? comparison.left : comparison.right;
}
