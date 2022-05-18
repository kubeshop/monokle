import {ResourceComparison} from '@redux/reducers/compare';

type FilterOptions = {
  search?: string;
};

type ComparisonFilter = (value: ResourceComparison) => boolean;

export function filterComparisons(allComparisons: ResourceComparison[], filters: ComparisonFilter[]) {
  return filters.reduce((comparison, filter) => comparison.filter(filter), allComparisons);
}

export function createResourceFilters({search}: FilterOptions) {
  const filters: ComparisonFilter[] = [];

  if (search) {
    filters.push(comparison => {
      const name = comparison.isMatch || comparison.left ? comparison.left.name : comparison.right.name;
      return name.toLowerCase().includes(search);
    });
  }

  return filters;
}
