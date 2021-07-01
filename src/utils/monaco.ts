import { monaco } from 'react-monaco-editor';

const KUBESHOP_MONACO_THEME = 'kubeshopTheme';

const createKubeshopTheme = (editor: typeof monaco.editor) => {
    editor.defineTheme(KUBESHOP_MONACO_THEME, {
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
    });
};

createKubeshopTheme(monaco.editor);

export { KUBESHOP_MONACO_THEME };
