import * as React from 'react';
import {useAppSelector} from '@redux/hooks';
import styled from 'styled-components';

import {BackgroundColors} from '@styles/Colors';
import {AppBorders} from '@styles/Borders';
import Footer from '@components/atoms/Footer';
import packageJson from '@root/package.json';
import {ROOT_FILE_ENTRY} from '@src/constants';

const StyledFooter = styled(Footer)`
  width: 100%;
  height: 1.5em;
  padding-left: 10px;
  background: ${BackgroundColors.darkThemeBackground};
  border-top: ${AppBorders.pageDivider};
`;

const PageFooter = () => {
  const fileMap = useAppSelector(state => state.main.fileMap);
  const rootEntry = fileMap[ROOT_FILE_ENTRY];

  const footerText = `Monokle ${packageJson.version} - kubeshop.io 2021${
    rootEntry && rootEntry.children ? ` - ${rootEntry.filePath}` : ''
  }`;

  return <StyledFooter noborder>{footerText}</StyledFooter>;
};

export default PageFooter;
