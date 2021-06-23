import * as React from 'react';
import {useAppSelector} from '@redux/hooks';
import styled from 'styled-components';
import path from 'path';

import packageJson from '@root/package.json';
import {appColors as colors} from '@styles/AppColors';

const FooterContainer = styled.div`
  border: 1px solid blue;
  border-radius: 2px;
  background: ${colors.appNormalBackgroound};
  width: 100%;
  height: 100%;
  font-size: 0.9em;
  font-weight: 400;
  line-height: 1.5;
  color: #212529;
  text-align: left;
  margin: 0;
  padding: 0;
  padding-left: 10px;
`;

const Footer = () => {
  const rootEntry = useAppSelector(state => state.main.rootEntry);

  const footerText = `Monokle ${packageJson.version} - kubeshop.io 2021${rootEntry.children ? ` - ${rootEntry.folder}${path.sep}${rootEntry.name}` : ''}`;

  return (
    <FooterContainer>
      {footerText}
    </FooterContainer>
  );
};

export default Footer;
