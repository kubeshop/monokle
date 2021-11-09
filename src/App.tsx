import React from 'react';

import {Size} from '@models/window';

import {
  DiffModal,
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

import {Layout} from '@atoms';

import ValidationErrorsModal from '@components/molecules/ValidationErrorsModal';
import {ClusterDiffModal} from '@components/organisms';
import UpdateModal from '@components/organisms/UpdateModal';

import {useWindowSize} from '@utils/hooks';

import AppContext from './AppContext';
import 'antd/dist/antd.less';

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
        <ClusterDiffModal />
      </div>
    </AppContext.Provider>
  );
};

export default App;
