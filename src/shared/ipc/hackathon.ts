import {ChatCompletionRequestMessage} from 'openai';

export type CreateChatCompletionParams = {
  messages: ChatCompletionRequestMessage[];
};
