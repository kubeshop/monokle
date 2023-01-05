import {Config, RefPosition, ValidationResponse} from '@monokle/validation';

import {SarifRule} from './policy';

type Initialization = 'uninitialized' | 'loading' | 'error' | 'loaded';

export type ValidationSliceState = {
  config: Config;
  lastResponse?: ValidationResponse;
  loadRequestId?: string;
  status: Initialization;
};

export type ResourceValidationError = {
  property: string;
  message: string;
  errorPos?: RefPosition;
  description?: string;
  rule?: SarifRule;
};

export type ResourceValidation = {
  isValid: boolean;
  errors: ResourceValidationError[];
};
