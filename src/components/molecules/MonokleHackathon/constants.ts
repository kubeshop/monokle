import {monaco} from 'react-monaco-editor';

import {ChatCompletionRequestMessage} from 'openai';

export const GENERATION_ERROR_MESSAGE = 'No resource content was generated. Please try to give a better description.';

export const REGEX_CODE = /`{3}[\s\S]*?`{3}|`{1}[\s\S]*?`{1}/g;

export const SYSTEM_PROMPT: ChatCompletionRequestMessage = {
  role: 'system',
  content: `
  In this interaction, we'll be focusing on creating Kubernetes YAML code based on specific user inputs.
  The aim is to generate a precise and functioning YAML code that matches the user's requirements.
  Your output should consist exclusively of the YAML code necessary to fulfill the given task.
  Remember, the output code may span across multiple documents if that's what's needed to incorporate all necessary Kubernetes objects.`,
};

export const EDITOR_OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions = {
  readOnly: true,
  fontWeight: 'bold',
  minimap: {
    enabled: false,
  },
};
