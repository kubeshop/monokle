import {Config, ValidationResponse} from '@monokle/validation';

type Initialization = 'uninitialized' | 'loading' | 'error' | 'loaded';

export type ValidationSliceState = {
  config: Config;
  lastResponse?: ValidationResponse;
  loadRequestId?: string;
  status: Initialization;
};
