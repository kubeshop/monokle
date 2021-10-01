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
  RenameResourceModal,
} from '@organisms';
import {Size} from '@models/window';
import {useWindowSize} from '@utils/hooks';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {AppState} from '@models/appstate';
import {ROOT_FILE_ENTRY} from '@constants/constants';
import {ipcRenderer, remote} from 'electron';
import {setAlert} from '@redux/reducers/alert';
import {AlertEnum, AlertType} from '@models/alert';
import ValidationErrorsModal from '@components/molecules/ValidationErrorsModal';
import UpdateModal from '@components/organisms/UpdateModal';
import AppContext from './AppContext';

const App = () => {
  const dispatch = useAppDispatch();
  const size: Size = useWindowSize();
  const mainState: AppState = useAppSelector(state => state.main);

  const mainHeight = `${size.height}px`;

  useEffect(() => {
    if (mainState.previewType && mainState.previewResourceId) {
      remote.getCurrentWindow().setTitle(mainState.previewResourceId);
    } else if (mainState.fileMap && mainState.fileMap[ROOT_FILE_ENTRY] && mainState.fileMap[ROOT_FILE_ENTRY].filePath) {
      remote.getCurrentWindow().setTitle(mainState.fileMap[ROOT_FILE_ENTRY].filePath);
    } else {
      remote.getCurrentWindow().setTitle('Monokle');
    }
  }, [mainState]);

  ipcRenderer.on('missing-dependency-result', (_, {dependencies}) => {
    const alert: AlertType = {
      type: AlertEnum.Warning,
      title: 'Missing dependency',
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
        <RenameResourceModal />
        <ValidationErrorsModal />
        <UpdateModal />
      </div>
    </AppContext.Provider>
  );
};

export default App;
