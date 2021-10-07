import React, {useCallback, useEffect, useState} from 'react';
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
import {useSelector} from 'react-redux';
import {ROOT_FILE_ENTRY} from '@constants/constants';
import {ipcRenderer, remote} from 'electron';
import {setAlert} from '@redux/reducers/alert';
import {AlertEnum, AlertType} from '@models/alert';
import ValidationErrorsModal from '@components/molecules/ValidationErrorsModal';
import UpdateModal from '@components/organisms/UpdateModal';
import {isInPreviewModeSelector} from '@redux/selectors';
import {K8sResource} from '@models/k8sresource';
import {HelmChart, HelmValuesFile} from '@models/helm';
import AppContext from './AppContext';

const App = () => {
  const dispatch = useAppDispatch();
  const size: Size = useWindowSize();
  const isInPreviewMode = useSelector(isInPreviewModeSelector);
  const previewType = useAppSelector(state => state.main.previewResourceId);
  const previewResourceId = useAppSelector(state => state.main.previewResourceId);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const [previewResource, setPreviewResource] = useState<K8sResource>();
  const [previewValuesFile, setPreviewValuesFile] = useState<HelmValuesFile>();
  const [helmChart, setHelmChart] = useState<HelmChart>();
  const previewValuesFileId = useAppSelector(state => state.main.previewValuesFileId);
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
  const helmChartMap = useAppSelector(state => state.main.helmChartMap);

  const mainHeight = `${size.height}px`;

  useEffect(() => {
    if (previewResourceId) {
      setPreviewResource(resourceMap[previewResourceId]);
    } else {
      setPreviewResource(undefined);
    }

    if (previewValuesFileId && helmValuesMap[previewValuesFileId]) {
      const valuesFile = helmValuesMap[previewValuesFileId];
      setPreviewValuesFile(valuesFile);
      setHelmChart(helmChartMap[valuesFile.helmChartId]);
    } else {
      setPreviewValuesFile(undefined);
      setHelmChart(undefined);
    }
  }, [previewResourceId, previewValuesFileId, helmValuesMap, resourceMap, helmChartMap]);

  useEffect(() => {
    if (isInPreviewMode && previewType === 'kustomization') {
      remote.getCurrentWindow().setTitle(previewResource ? `[${previewResource.name}] kustomization` : `Monokle`);
      return;
    }
    if (isInPreviewMode && previewType === 'cluster') {
      remote.getCurrentWindow().setTitle(String(previewResourceId) && 'Monokle');
      return;
    }
    if (isInPreviewMode && previewType === 'helm') {
      remote.getCurrentWindow().setTitle(`${previewValuesFile?.name} for ${helmChart?.name} Helm chart`);
      return;
    }
    if (fileMap && fileMap[ROOT_FILE_ENTRY] && fileMap[ROOT_FILE_ENTRY].filePath) {
      remote.getCurrentWindow().setTitle(fileMap[ROOT_FILE_ENTRY].filePath);
      return;
    }
    remote.getCurrentWindow().setTitle('Monokle');
  }, [isInPreviewMode, previewType, previewResource, previewResourceId, previewValuesFile, helmChart, fileMap]);

  const onMissingDependencyResult = useCallback(
    (_, {dependencies}) => {
      const alert: AlertType = {
        type: AlertEnum.Warning,
        title: 'Missing dependency',
        message: `${dependencies.toString()} must be installed for all Monokle functionality to be available`,
      };
      dispatch(setAlert(alert));
    },
    [dispatch]
  );

  useEffect(() => {
    ipcRenderer.on('missing-dependency-result', onMissingDependencyResult);
    return () => {
      ipcRenderer.removeListener('missing-dependency-result', onMissingDependencyResult);
    };
  }, [onMissingDependencyResult]);

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
