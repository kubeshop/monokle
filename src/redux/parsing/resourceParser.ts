import {createWorkerEventPromise} from '@utils/worker';

import {ResourceParser} from '@monokle/validation';

import {
  ClearCacheMessage,
  ClearCacheMessageType,
  ProcessRefsMessage,
  ProcessRefsMessageType,
} from './parser.worker.types';

class ResourceParserWorker {
  #worker: Worker;
  #parser: ResourceParser;

  constructor() {
    this.#worker = new Worker(new URL('./parser.worker', import.meta.url));
    this.#parser = new ResourceParser();
  }

  async processRefs(input: ProcessRefsMessage['input']) {
    return createWorkerEventPromise<ProcessRefsMessage['output']>({
      type: ProcessRefsMessageType,
      worker: this.#worker,
      input,
    });
  }

  getParser() {
    return this.#parser;
  }

  clear(resourceIds?: string[]) {
    this.#parser.clear(resourceIds);
    createWorkerEventPromise<ClearCacheMessage['output']>({
      type: ClearCacheMessageType,
      worker: this.#worker,
      input: {
        resourceIds,
      },
    });
  }
}

export const RESOURCE_PARSER = new ResourceParserWorker();
