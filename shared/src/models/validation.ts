import {Config, ValidationResponse} from '@monokle/validation';

type Initialization = 'uninitialized' | 'loading' | 'error' | 'loaded';

type ValidationSliceState = {
  config: Config;
  lastResponse?: ValidationResponse;
  loadRequestId?: string;
  status: Initialization;
};

export type {ValidationSliceState};
