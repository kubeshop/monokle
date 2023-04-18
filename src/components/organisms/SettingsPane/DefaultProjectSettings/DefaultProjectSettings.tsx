import _ from 'lodash';

import {
  setKubeConfig,
  updateApplicationSettings,
  updateFileIncludes,
  updateFolderReadsMaxDepth,
  updateK8sVersion,
  updateScanExcludes,
} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {PREDEFINED_K8S_VERSION} from '@shared/constants/k8s';
import {ProjectConfig} from '@shared/models/config';
import {isEqual} from '@shared/utils/isEqual';

import {Settings} from '../Settings/Settings';

export const DefaultProjectSettings = () => {
  const dispatch = useAppDispatch();
  const appConfig = useAppSelector(state => state.config);

  const changeApplicationConfig = (config: ProjectConfig) => {
    dispatch(
      updateApplicationSettings({
        ...config.settings,
        helmPreviewMode: config.settings?.helmPreviewMode || 'template',
        kustomizeCommand: config.settings?.kustomizeCommand || 'kubectl',
      })
    );

    if (!isEqual(config.kubeConfig?.path, appConfig.kubeConfig.path)) {
      dispatch(setKubeConfig({...appConfig.kubeConfig, path: config.kubeConfig?.path}));
    }
    if (!isEqual(config?.folderReadsMaxDepth, appConfig.folderReadsMaxDepth)) {
      dispatch(updateFolderReadsMaxDepth(config?.folderReadsMaxDepth || 10));
    }
    if (!isEqual(config?.k8sVersion, appConfig.k8sVersion)) {
      dispatch(updateK8sVersion(config?.k8sVersion || PREDEFINED_K8S_VERSION));
    }
    if (!isEqual(_.sortBy(config?.scanExcludes), _.sortBy(appConfig.scanExcludes))) {
      dispatch(updateScanExcludes(config?.scanExcludes || []));
    }
    if (!isEqual(_.sortBy(config?.fileIncludes), _.sortBy(appConfig.fileIncludes))) {
      dispatch(updateFileIncludes(config?.fileIncludes || []));
    }
  };

  return <Settings config={appConfig} onConfigChange={changeApplicationConfig} />;
};
