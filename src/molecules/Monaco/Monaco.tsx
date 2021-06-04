import React from 'react';
import Editor from '@monaco-editor/react';
import * as fs from "fs";
import path from "path";

const Monaco = () => {
  let filename = path.join(__dirname, "../../../../../../../../deployment.yaml")
  let data = fs.readFileSync(filename, 'utf8')
  console.log( "dirname: " + __dirname )
  console.log( data )

  return (
      <div>
        <Editor
            height="90vh"
            defaultLanguage="yaml"
            theme="vs-dark"
            defaultValue={data}
        />
      </div>
  );
};

export default Monaco;
