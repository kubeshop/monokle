import * as React from 'react';
import {FC} from "react";

interface StatusBarState {
  statusText: string
}

const Footer: FC<StatusBarState> = ({statusText}) => {
  return (
    <div>
      ManifestUI kubeshop.io 2021 - {statusText}
    </div>
  )
};

export default Footer;
