import * as React from 'react';
import { useAppSelector } from '../../redux/hooks';
import path from 'path';

const Footer = () => {
  const rootEntry = useAppSelector(state => state.main.rootEntry);

  return (
    <div>
      ManifestUI kubeshop.io 2021 {rootEntry.children && ('- ' + rootEntry.folder + path.sep + rootEntry.name)}
    </div>
  )
};

export default Footer;
