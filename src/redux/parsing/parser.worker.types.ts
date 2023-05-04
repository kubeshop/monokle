import {Incremental} from '@monokle/validation';
import {K8sResource} from '@shared/models/k8sResource';
import {ValidationResource} from '@shared/models/validation';

export const ProcessRefsMessageType = 'processRefs' as const;
export const ClearCacheMessageType = 'clearCache' as const;

export interface WorkerMessage {
  type: string;
  input: any;
  output: any;
}

export interface ProcessRefsMessage extends WorkerMessage {
  type: typeof ProcessRefsMessageType;
  input: {
    resources: K8sResource[];
    incremental?: Incremental;
    files?: string[];
  };
  output: {
    validationResources: ValidationResource[];
  };
}

export interface ClearCacheMessage extends WorkerMessage {
  type: typeof ClearCacheMessageType;
  input: {
    resourceIds?: string[];
  };
  output: void;
}

export const matchWorkerEvent = (event: MessageEvent, type: string) => event.data.type === type;
