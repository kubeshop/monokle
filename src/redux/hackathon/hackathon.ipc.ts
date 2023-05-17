import {invokeIpc} from '@utils/ipc';

import {CreateChatCompletionParams} from '@shared/ipc/hackathon';

export const createChatCompletion = invokeIpc<CreateChatCompletionParams, string | undefined>(
  'hackathon:createChatCompletion'
);
