import React from 'react';
import 'antd/dist/antd.less';
import {Layout} from '@atoms';
import {
  PageHeader,
  PageFooter,
  MessageBox,
  SettingsDrawer,
  DiffModal,
  StartupModal,
  HotKeysHandler,
  PaneManager,
  NewResourceWizard,
  RenameResourceModal,
  NotificationsDrawer,
} from '@organisms';
import {Size} from '@models/window';
import {useWindowSize} from '@utils/hooks';
import ValidationErrorsModal from '@components/molecules/ValidationErrorsModal';
import UpdateModal from '@components/organisms/UpdateModal';
import AppContext from './AppContext';

const App = () => {
  const size: Size = useWindowSize();

  const mainHeight = `${size.height}px`;

  return (
    <AppContext.Provider value={{windowSize: size}}>
      <div style={{overflowY: 'hidden'}}>
        <MessageBox />
        <Layout style={{height: mainHeight}}>
          <PageHeader />
          <SettingsDrawer />
          <NotificationsDrawer />
          <PaneManager />
          <PageFooter />
        </Layout>
        <DiffModal />
        <StartupModal />
        <NewResourceWizard />
        <HotKeysHandler />
        <RenameResourceModal />
        <ValidationErrorsModal />
        <UpdateModal />
      </div>
    </AppContext.Provider>
  );
};

export default App;
