import {Config, CustomSchema, Resource, ValidationResponse} from '@monokle/validation';

export const LoadValidationMessageType = 'loadValidation' as const;
export const RunValidationMessageType = 'runValidation' as const;
export const RegisterCustomSchemaMessageType = 'registerCustomSchema' as const;

export interface WorkerMessage {
  type: string;
  input: any;
  output: any;
}

export interface LoadValidationMessage extends WorkerMessage {
  type: typeof LoadValidationMessageType;
  input: {
    config: Config;
  };
  output: void;
}

export interface RunValidationMessage extends WorkerMessage {
  type: typeof RunValidationMessageType;
  input: {
    resources: Resource[];
  };
  output: {
    response: ValidationResponse;
  };
}

export interface RegisterCustomSchemaMessage extends WorkerMessage {
  type: typeof RegisterCustomSchemaMessageType;
  input: {
    schema: CustomSchema;
  };
  output: {
    response: void;
  };
}

export const matchWorkerEvent = (event: MessageEvent, type: string) => event.data.type === type;
