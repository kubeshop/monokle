import * as React from 'react';
import {AppState} from "../../models/state";
import {FC} from "react";

const FileTreePane: FC<AppState> = ({ files, rootFolder }) => {
  return (
    <div>
      <h4>Root: {rootFolder}</h4>
      {
        files.map(item => {
          return (
          <h5>{item.name}</h5>
          )
        })
      }
    </div>
  );
};

export default FileTreePane;
