/// <reference lib="webworker" />
import {WorkerMessage, matchWorkerEvent} from '@utils/worker';

import {ResourceParser, SchemaLoader, createDefaultMonokleValidator} from '@monokle/validation';

import {
  BulkRegisterCustomSchemaMessage,
  BulkRegisterCustomSchemaMessageType,
  LoadValidationMessage,
  LoadValidationMessageType,
  RegisterCustomSchemaMessage,
  RegisterCustomSchemaMessageType,
  RunValidationMessage,
  RunValidationMessageType,
} from './validation.worker.types';

const RESOURCE_PARSER = new ResourceParser();
const SCHEMA_LOADER = new SchemaLoader();
const VALIDATOR = createDefaultMonokleValidator(RESOURCE_PARSER, SCHEMA_LOADER);

const handleEvent = <Message extends WorkerMessage>(
  event: MessageEvent,
  type: Message['type'],
  handler: (input: Message['input']) => Promise<Message['output']>
): void => {
  if (!matchWorkerEvent(event, type)) {
    return;
  }
  const {input} = event.data as Message;
  handler(input).then(output => {
    postMessage({type, output});
  });
};

onmessage = async event => {
  const {data} = event;

  handleEvent<LoadValidationMessage>(event, LoadValidationMessageType, async () => {
    const {input} = data as LoadValidationMessage;
    await VALIDATOR.preload(input.config);
  });

  handleEvent<RunValidationMessage>(event, RunValidationMessageType, async () => {
    const {input} = data as RunValidationMessage;
    const response = await VALIDATOR.validate({resources: input.resources, incremental: input.incremental});
    return {response};
  });

  handleEvent<RegisterCustomSchemaMessage>(event, RegisterCustomSchemaMessageType, async () => {
    const {input} = data as RegisterCustomSchemaMessage;
    await VALIDATOR.registerCustomSchema(input.schema);
  });

  handleEvent<BulkRegisterCustomSchemaMessage>(event, BulkRegisterCustomSchemaMessageType, async () => {
    const {input} = data as BulkRegisterCustomSchemaMessage;
    await Promise.all(input.schemas.map(schema => VALIDATOR.registerCustomSchema(schema)));
  });
};

export default null;
