import {ipcRenderer} from 'electron';

import React, {useEffect, useState} from 'react';

import styled from 'styled-components';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {useAppSelector} from '@redux/hooks';

import Footer from '@components/atoms/Footer';

import {AppBorders} from '@styles/Borders';
import Colors, {BackgroundColors} from '@styles/Colors';

const StyledFooter = styled(Footer)`
  width: 100%;
  padding-left: 10px;
  background: ${BackgroundColors.darkThemeBackground};
  border-top: ${AppBorders.pageDivider};
  color: ${Colors.grey7};
  user-select: none;
`;

const PageFooter = () => {
  const [appVersion, setAppVersion] = useState('');
  const [footerText, setFooterText] = useState('');
  const fileMap = useAppSelector(state => state.main.fileMap);
  const rootEntry = fileMap[ROOT_FILE_ENTRY];

  // not counting the root
  const nrOfFiles = Object.values(fileMap).filter(f => !f.children).length;

  ipcRenderer.send('app-version');
  ipcRenderer.once('app-version', (_, {version}) => {
    setAppVersion(version);
  });

  useEffect(() => {
    setFooterText(
      `Monokle ${appVersion} - kubeshop.io 2022${
        rootEntry && rootEntry.children ? ` - ${rootEntry.filePath} - ${nrOfFiles} files` : ''
      }`
    );
  }, [appVersion, nrOfFiles, rootEntry]);

  return <StyledFooter noborder="true">{footerText}</StyledFooter>;
};

export default PageFooter;
