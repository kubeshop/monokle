import { monaco } from 'react-monaco-editor';

import Colors from "@styles/Colors";

const KUBESHOP_MONACO_THEME = 'kubeshopTheme';
const KUBESHOP_MONACO_DIFF_THEME = 'kubeshopDiffTheme';

const KUBESHOP_THEME_DATA: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
      { token: 'string.yaml', foreground: '61b0eb' },
      { token: 'number.yaml', foreground: '61b0eb' },
  ],
  colors: {
      'editor.lineHighlightBackground': '#112e40',
      'editor.background': '#000000',
  }
};

const createKubeshopTheme = (editor: typeof monaco.editor) => {
    editor.defineTheme(KUBESHOP_MONACO_THEME, KUBESHOP_THEME_DATA);
};

const createKubeshopDiffTheme = (editor: typeof monaco.editor) => {
  editor.defineTheme(KUBESHOP_MONACO_DIFF_THEME, {
    ...KUBESHOP_THEME_DATA,
    colors: {
      ...KUBESHOP_THEME_DATA.colors,
      'editor.background': Colors.grey1000
    }
  });
};

createKubeshopTheme(monaco.editor);
createKubeshopDiffTheme(monaco.editor);

export { KUBESHOP_MONACO_THEME, KUBESHOP_MONACO_DIFF_THEME };
