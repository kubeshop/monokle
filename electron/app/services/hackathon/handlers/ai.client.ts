import {Configuration, OpenAIApi} from 'openai';

import {electronStore} from '@shared/utils';

let openai: OpenAIApi | undefined;

export const getOpenAIClient = () => {
  const apiKey: string | undefined = electronStore.get('appConfig.userApiKeys.OpenAI');
  if (!apiKey) {
    return;
  }

  if (!openai) {
    const openAiConfiguration = new Configuration({
      apiKey,
    });
    openai = new OpenAIApi(openAiConfiguration);
  }

  return openai;
};
