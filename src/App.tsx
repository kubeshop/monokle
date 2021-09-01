import React, {useEffect} from 'react';
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
} from '@organisms';
import {Size} from '@models/window';
import {useWindowSize} from '@utils/hooks';
import {useAppDispatch} from '@redux/hooks';
import {initKubeconfig} from '@redux/reducers/appConfig';
import {ipcRenderer} from 'electron';
import {setAlert} from '@redux/reducers/alert';
import {AlertEnum, AlertType} from '@models/alert';

import AppContext from './AppContext';

const App = () => {
  const dispatch = useAppDispatch();
  const size: Size = useWindowSize();

  const mainHeight = `${size.height}px`;

  useEffect(() => {
    dispatch(initKubeconfig());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  ipcRenderer.on('missing-dependency-result', (_, {dependencies}) => {
    const alert: AlertType = {
      type: AlertEnum.Warning,
      title: 'Missing dependecy',
      message: `${dependencies.toString()} must be installed for all Monokle functionality to be available`,
    };
    dispatch(setAlert(alert));
  });

  return (
    <AppContext.Provider value={{windowSize: size}}>
      <div style={{overflowY: 'hidden'}}>
        <MessageBox />
        <Layout style={{height: mainHeight}}>
          <PageHeader />
          <SettingsDrawer />
          <PaneManager />
          <PageFooter />
        </Layout>
        <DiffModal />
        <StartupModal />
        <NewResourceWizard />
        <HotKeysHandler />
      </div>
    </AppContext.Provider>
  );
};

export default App;
