import log from 'loglevel';

import {RESOURCE_PARSER} from '@redux/parsing/resourceParser';

import {createWorkerEventPromise} from '@utils/worker';

import {CustomSchema, MonokleValidator, SchemaLoader, createExtensibleMonokleValidator} from '@monokle/validation';

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
    this.#validator = createExtensibleMonokleValidator(RESOURCE_PARSER.getParser(), SCHEMA_LOADER);
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

  async bulkRegisterCustomSchemas(schemas: CustomSchema[]) {
    await Promise.all(schemas.map(schema => this.registerCustomSchema(schema)));
  }

  async registerCustomSchema(input: RegisterCustomSchemaMessage['input']) {
    try {
      await this.#validator.registerCustomSchema(input.schema);
    } catch {
      log.warn(`Failed to register custom schema for ${input.schema?.apiVersion}/${input.schema?.kind}`);
    }
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
