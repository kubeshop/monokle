import log from 'loglevel';

import {CreateChatCompletionParams} from '@shared/ipc/hackathon';

import {getOpenAIClient} from './ai.client';

export async function createChatCompletion({messages}: CreateChatCompletionParams): Promise<string | undefined> {
  const openai = getOpenAIClient();
  if (!openai) {
    return;
  }
  const startTime = new Date().getTime();
  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages,
  });
  const endTime = new Date().getTime();
  log.info('createChatCompletion execution time: ', (endTime - startTime) / 1000);
  const content = completion.data.choices[0].message?.content;
  return content;
}
