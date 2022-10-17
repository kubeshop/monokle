import {isDefined} from '@utils/filter';

import {PartialResourceSet, ResourceSet} from './state';

export function isCompleteResourceSet(options: PartialResourceSet | undefined): options is ResourceSet {
  switch (options?.type) {
    case 'local':
      return true;
    case 'cluster':
      return isDefined(options.context);
    case 'kustomize':
      return isDefined(options.kustomizationId);
    case 'helm':
      return isDefined(options.chartId) && isDefined(options.valuesId);
    case 'helm-custom':
      return isDefined(options.chartId) && isDefined(options.configId);
    case 'git':
      return isDefined(options.branchName) && isDefined(options.commitHash);
    default:
      return false;
  }
}
