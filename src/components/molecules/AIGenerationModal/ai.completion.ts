import log from 'loglevel';
import {ChatCompletionRequestMessage} from 'openai';

import {getOpenAIClient} from './ai.client';

export type CreateChatCompletionParams = {
  messages: ChatCompletionRequestMessage[];
};

export async function createChatCompletion({messages}: CreateChatCompletionParams): Promise<string | undefined> {
  const openai = getOpenAIClient();
  if (!openai) {
    return;
  }
  const startTime = new Date().getTime();
  log.info('[createChatCompletion]: Waiting for OpenAI response...');
  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages,
    n: 1,
  });
  const endTime = new Date().getTime();
  log.info('[createChatCompletion]: Execution time: ', (endTime - startTime) / 1000);
  const content = completion.data.choices[0].message?.content;
  return content;
}
