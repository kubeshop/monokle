import * as React from 'react';
import {useAppSelector} from '@redux/hooks';
import styled from 'styled-components';

import Colors, {BackgroundColors} from '@styles/Colors';
import {AppBorders} from '@styles/Borders';
import Footer from '@components/atoms/Footer';
import packageJson from '@root/package.json';

const StyledFooter = styled(Footer)`
  width: 100%;
  height: 1.5em;
  padding-left: 10px;
  background: ${BackgroundColors.darkThemeBackground};
  border-top: ${AppBorders.pageDivider};
  color: ${Colors.grey7};
`;

const PageFooter = () => {
  const rootEntry = useAppSelector(state => state.main.rootEntry);
  const fsEntryMap = useAppSelector(state => state.main.fsEntryMap);

  const nrOfFiles = Object.keys(fsEntryMap).length;

  const footerText = `Monokle ${packageJson.version} - kubeshop.io 2021${
    rootEntry ? ` - ${rootEntry.absPath} - ${nrOfFiles} files` : ''
  }`;

  return <StyledFooter noborder="true">{footerText}</StyledFooter>;
};

export default PageFooter;
