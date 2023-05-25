import {Configuration, OpenAIApi} from 'openai';

import {electronStore} from '@shared/utils';

let openai: OpenAIApi | undefined;
let lastApiKey: string | undefined;

export const getOpenAIClient = () => {
  const apiKey: string | undefined = electronStore.get('appConfig.userApiKeys.OpenAI');
  if (!apiKey) {
    return;
  }

  if (!openai || lastApiKey !== apiKey) {
    const openAiConfiguration = new Configuration({
      apiKey,
    });
    openai = new OpenAIApi(openAiConfiguration);
  }

  lastApiKey = apiKey;

  return openai;
};
