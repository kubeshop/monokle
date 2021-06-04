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
        width="800"
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
