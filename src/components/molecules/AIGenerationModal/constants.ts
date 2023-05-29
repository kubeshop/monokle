import {monaco} from 'react-monaco-editor';

export const GENERATION_ERROR_MESSAGE = 'No resource content was generated. Please try to give a better description.';

export const REGEX_CODE = /`{3}[\s\S]*?`{3}|`{1}[\s\S]*?`{1}/g;

export const EDITOR_OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions = {
  readOnly: true,
  fontWeight: 'bold',
  minimap: {
    enabled: false,
  },
};

export const SYSTEM_PROMPT = {role: 'system', content: ''};
