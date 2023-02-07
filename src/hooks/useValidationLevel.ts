import {
  errorsByResourceSelector,
  useValidationSelector,
  warningsByResourceSelector,
} from '@redux/validation/validation.selectors';

import {RuleLevel} from '@monokle/validation';

export const useValidationLevel = (resourceId: string) => {
  const errors = useValidationSelector(s => errorsByResourceSelector(s, resourceId));
  const warnings = useValidationSelector(s => warningsByResourceSelector(s, resourceId));

  const level: RuleLevel | 'both' | 'none' =
    errors.length && warnings.length ? 'both' : errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'none';

  return {level, errors, warnings};
};
