import 'antd/dist/antd.less';

import styled from 'styled-components';

import {Size} from '@models/window';

import {
  ClusterDiffModal,
  ClusterResourceDiffModal,
  CreateFolderModal,
  HotKeysHandler,
  LocalResourceDiffModal,
  MessageBox,
  NewResourceWizard,
  NotificationsDrawer,
  PageFooter,
  PageHeader,
  PaneManager,
  QuickSearchActions,
  RenameEntityModal,
  RenameResourceModal,
  SettingsDrawer,
  StartupModal,
  UpdateModal,
} from '@organisms';

import {useWindowSize} from '@utils/hooks';

import AppContext from './AppContext';

const AppContainer = styled.div<{$height: number; $width: number}>`
  ${props => (props.$height ? `height: ${props.$height}px;` : `height: 100%;`)}
  ${props => (props.$width ? `width: ${props.$width}px;` : `width: 100%;`)}
  overflow: hidden;
`;

const MainContainer = styled.div`
  height: 100%;
  width: 100%;
`;

const App = () => {
  const size: Size = useWindowSize();

  return (
    <AppContext.Provider value={{windowSize: size}}>
      <AppContainer $height={size.height} $width={size.width}>
        <MessageBox />
        <MainContainer>
          <PageHeader />
          <SettingsDrawer />
          <NotificationsDrawer />
          <PaneManager />
          <PageFooter />
        </MainContainer>
        <LocalResourceDiffModal />
        <ClusterResourceDiffModal />
        <StartupModal />
        <NewResourceWizard />
        <QuickSearchActions />
        <HotKeysHandler />
        <RenameResourceModal />
        <UpdateModal />
        <ClusterDiffModal />
        <RenameEntityModal />
        <CreateFolderModal />
      </AppContainer>
    </AppContext.Provider>
  );
};

export default App;
