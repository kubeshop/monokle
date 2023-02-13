import {RESOURCE_PARSER} from '@redux/parsing/resourceParser';

import {createWorkerEventPromise} from '@utils/worker';

import {MonokleValidator, SchemaLoader, createDefaultMonokleValidator} from '@monokle/validation';

import {
  LoadValidationMessage,
  LoadValidationMessageType,
  RegisterCustomSchemaMessage,
  RegisterCustomSchemaMessageType,
  RunValidationMessage,
  RunValidationMessageType,
} from './validation.worker.types';

export const SCHEMA_LOADER = new SchemaLoader();

class ValidationWorker {
  #worker: Worker;
  #validator: MonokleValidator;

  constructor() {
    this.#worker = new Worker(new URL('./validation.worker', import.meta.url));
    this.#validator = createDefaultMonokleValidator(RESOURCE_PARSER.getParser(), SCHEMA_LOADER);
  }

  get metadata() {
    return this.#validator.metadata;
  }

  get rules() {
    return this.#validator.rules;
  }

  async loadValidation(input: LoadValidationMessage['input']) {
    await this.#validator.preload(input.config);
    return createWorkerEventPromise<LoadValidationMessage['output']>({
      type: LoadValidationMessageType,
      worker: this.#worker,
      input,
    });
  }

  runValidation(input: RunValidationMessage['input']) {
    return createWorkerEventPromise<RunValidationMessage['output']>({
      type: RunValidationMessageType,
      worker: this.#worker,
      input,
    });
  }

  async registerCustomSchema(input: RegisterCustomSchemaMessage['input']) {
    await this.#validator.registerCustomSchema(input.schema);
    return createWorkerEventPromise<RegisterCustomSchemaMessage['output']>({
      type: RegisterCustomSchemaMessageType,
      worker: this.#worker,
      input,
    });
  }

  isRuleEnabled(rule: string) {
    return this.#validator.isRuleEnabled(rule);
  }

  getPlugin(name: string) {
    return this.#validator.getPlugin(name);
  }
}

export const VALIDATOR = new ValidationWorker();
