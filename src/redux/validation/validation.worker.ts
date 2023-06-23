/// <reference lib="webworker" />
import {WorkerMessage, matchWorkerEvent} from '@utils/worker';

import {ResourceParser, SchemaLoader, createExtensibleMonokleValidator} from '@monokle/validation';

import {validationCustomPluginLoader} from './validation.loader';
import {
  LoadValidationMessage,
  LoadValidationMessageType,
  RegisterCustomSchemaMessage,
  RegisterCustomSchemaMessageType,
  RunValidationMessage,
  RunValidationMessageType,
} from './validation.worker.types';

const RESOURCE_PARSER = new ResourceParser();
const SCHEMA_LOADER = new SchemaLoader();
const VALIDATOR = createExtensibleMonokleValidator(RESOURCE_PARSER, SCHEMA_LOADER, validationCustomPluginLoader);

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
    try {
      await VALIDATOR.registerCustomSchema(input.schema);
    } catch {
      // we cannot use loglevel here because this is a worker
      // eslint-disable-next-line no-console
      console.warn(`Failed to register custom schema for ${input.schema?.apiVersion}/${input.schema?.kind}`);
    }
  });
};

export default null;
