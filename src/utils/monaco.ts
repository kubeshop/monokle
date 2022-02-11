import {monaco} from 'react-monaco-editor';

const KUBESHOP_MONACO_THEME = 'kubeshopTheme';
const KUBESHOP_INVALID_MONACO_THEME = 'kubeshopInvalidTheme';

const KUBESHOP_THEME_DATA: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    {token: 'string.yaml', foreground: '61b0eb'},
    {token: 'number.yaml', foreground: '61b0eb'},
  ],
  colors: {
    'editor.lineHighlightBackground': '#112e40',
    'editor.background': '#000000',
    'editorWarning.foreground': '#e65a6d',
  },
};

const KUBESHOP_INVALID_THEME_DATA: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    {token: 'string.yaml', foreground: '61b0eb'},
    {token: 'number.yaml', foreground: '61b0eb'},
  ],
  colors: {
    'editor.lineHighlightBackground': '#112e40',
    'editor.background': '#330000',
    'editorWarning.foreground': '#e65a6d',
  },
};

const createKubeshopTheme = (editor: typeof monaco.editor) => {
  editor.defineTheme(KUBESHOP_MONACO_THEME, KUBESHOP_THEME_DATA);
  editor.defineTheme(KUBESHOP_INVALID_MONACO_THEME, KUBESHOP_INVALID_THEME_DATA);
};

createKubeshopTheme(monaco.editor);

export {KUBESHOP_MONACO_THEME, KUBESHOP_INVALID_MONACO_THEME};
