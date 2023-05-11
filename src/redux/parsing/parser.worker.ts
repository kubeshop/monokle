/// <reference lib="webworker" />
import {transformResourceForValidation} from '@utils/resources';
import {handleEvent} from '@utils/worker';

import {ResourceParser, processRefs} from '@monokle/validation';
import {ValidationResource} from '@shared/models/validation';
import {isDefined} from '@shared/utils/filter';

import {
  ClearCacheMessage,
  ClearCacheMessageType,
  ProcessRefsMessage,
  ProcessRefsMessageType,
} from './parser.worker.types';

const RESOURCE_PARSER = new ResourceParser();

onmessage = async event => {
  const {data} = event;

  handleEvent<ProcessRefsMessage>(event, ProcessRefsMessageType, async () => {
    const {input} = data as ProcessRefsMessage;

    const transformedResources = input.resources.map(transformResourceForValidation).filter(isDefined);
    const processedResources = processRefs(
      transformedResources,
      RESOURCE_PARSER,
      input.incremental,
      input.files
    ) as ValidationResource[];

    return {validationResources: processedResources};
  });

  handleEvent<ClearCacheMessage>(event, ClearCacheMessageType, async () => {
    const {input} = data as ClearCacheMessage;
    RESOURCE_PARSER.clear(input.resourceIds);
  });
};

export default null;
