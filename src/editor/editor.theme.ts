import {monaco} from 'react-monaco-editor';

const KUBESHOP_MONACO_THEME = 'kubeshopTheme';

const KUBESHOP_THEME_DATA: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    {token: 'string.yaml', foreground: '61b0eb'},
    {token: 'number.yaml', foreground: '61b0eb'},
  ],
  colors: {
    'editor.lineHighlightBackground': '#112e40',
    'editor.background': '#0a0d0e',
  },
};

const createKubeshopTheme = (editor: typeof monaco.editor) => {
  editor.defineTheme(KUBESHOP_MONACO_THEME, KUBESHOP_THEME_DATA);
};

createKubeshopTheme(monaco.editor);

export {KUBESHOP_MONACO_THEME};
