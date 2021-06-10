import * as React from 'react';
import { useAppSelector } from '../../redux/hooks';

const Footer = () => {
  const statusText = useAppSelector(state => state.statusText);

  return (
    <div>
      ManifestUI kubeshop.io 2021 - {statusText}
    </div>
  )
};

export default Footer;
