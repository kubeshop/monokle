import React from 'react';
import MonacoEditor from 'react-monaco-editor';

interface IProps {
}

interface IState {
  code: any;
}

class Monaco extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      code: '// type your code...',
    }
  }

  // eslint-disable-next-line no-unused-vars
  editorDidMount(editor: any, monaco: any) {
    console.log('editorDidMount', editor);
    editor.focus();
  }

  onChange(newValue: any, e: any) {
    console.log('onChange', newValue, e);
  }

  render() {
    const code = this.state.code;

    const options = {
      selectOnLineNumbers: true
    };

    return (
      <MonacoEditor
        width="600"
        height="600"
        language="shell"
        theme="vs-dark"
        value={code}
        options={options}
        onChange={this.onChange}
        editorDidMount={this.editorDidMount}
      />
    );
  }
}

export default Monaco;
