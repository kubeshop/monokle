import 'antd/dist/antd.less';

import styled from 'styled-components';

import {Size} from '@models/window';

import {
  HotKeysHandler,
  MessageBox,
  NewResourceWizard,
  NotificationsDrawer,
  PageFooter,
  PageHeader,
  PaneManager,
  RenameResourceModal,
  SettingsDrawer,
  StartupModal,
} from '@organisms';

import {ClusterDiffModal} from '@components/organisms';
import ClusterResourceDiffModal from '@components/organisms/ClusterResourceDiffModal';
import CreateFolderModal from '@components/organisms/CreateFolderModal';
import QuickSearchActions from '@components/organisms/QuickSearchActions';
import RenameEntityModal from '@components/organisms/RenameEntityModal';
import UpdateModal from '@components/organisms/UpdateModal';

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
        {/* <DiffModal /> */}
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
