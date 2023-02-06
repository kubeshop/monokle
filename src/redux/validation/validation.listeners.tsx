import {Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import {isAnyOf} from '@reduxjs/toolkit';

import {isEmpty, isEqual} from 'lodash';

import {AppListenerFn} from '@redux/listeners/base';
import {updateK8sVersion, updateProjectK8sVersion} from '@redux/reducers/appConfig';
import {currentConfigSelector} from '@redux/selectors';
import {clusterResourceMapSelector} from '@redux/selectors/resourceMapSelectors';
import {loadClusterResources, reloadClusterResources} from '@redux/thunks/cluster';
import {downloadK8sSchema} from '@redux/thunks/downloadK8sSchema';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {doesSchemaExist} from '@utils/index';

import {isDefined} from '@shared/utils/filter';
import {activeProjectSelector, kubeConfigContextSelector} from '@shared/utils/selectors';

import {setConfigK8sSchemaVersion, toggleOPARules, toggleValidation} from './validation.slice';
import {loadValidation, validateResources} from './validation.thunks';

const loadListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(
      loadClusterResources.fulfilled,
      reloadClusterResources.fulfilled,
      setRootFolder.fulfilled,
      setConfigK8sSchemaVersion,
      toggleOPARules,
      toggleValidation
    ),
    async effect(_, {dispatch, delay, signal, cancelActiveListeners}) {
      cancelActiveListeners();
      await delay(1);
      const loading = dispatch(loadValidation());
      signal.addEventListener('abort', () => loading.abort());
      await loading;
    },
  });
};

const validateListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(loadValidation.fulfilled),
    async effect(_action, {dispatch, getState, cancelActiveListeners, signal, delay}) {
      cancelActiveListeners();

      // if (getState().resources.previewLoading) {
      //   return;
      // }

      const validatorsLoading = getState().validation.status === 'loading';
      if (validatorsLoading) return;

      await delay(1);
      if (signal.aborted) return;
      const response = dispatch(validateResources());
      signal.addEventListener('abort', () => response.abort());
      await response;
    },
  });
};

const clusterK8sSchemaVersionListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(loadClusterResources.fulfilled),
    async effect(_, {dispatch, getState, cancelActiveListeners, delay}) {
      cancelActiveListeners();
      await delay(1);

      const state = getState();

      const activeProject = activeProjectSelector(state);
      const clusterResourceMap = clusterResourceMapSelector(state);
      const currentContext = kubeConfigContextSelector(state);
      const localSchemaVersion = currentConfigSelector(getState()).k8sVersion;
      const userDataDir = String(state.config.userDataDir);

      const nodeResources = Object.values(clusterResourceMap).filter(
        resource => resource.apiVersion === 'v1' && resource.kind === 'Node'
      );

      if (isEmpty(nodeResources)) return;

      const clusterSchemaVersions = [
        ...new Set(
          nodeResources
            .map(resource => {
              const kubeletVersion = resource.object?.status?.nodeInfo?.kubeletVersion;
              if (typeof kubeletVersion !== 'string') {
                return undefined;
              }
              return kubeletVersion.split('+')[0].substring(1).trim();
            })
            .filter(isDefined)
        ),
      ];

      if (!isEmpty(clusterSchemaVersions)) return;

      if (clusterSchemaVersions.length === 1) {
        const clusterSchemaVersion = clusterSchemaVersions[0];
        if (isEqual(clusterSchemaVersion, localSchemaVersion)) return;

        Modal.confirm({
          icon: <ExclamationCircleOutlined />,
          title: 'Kubernetes version mismatch',
          content: `There is a mismatch between the "${currentContext}" cluster's Kubernetes version (${clusterSchemaVersion}) and the local version (${localSchemaVersion}). Do you want to change the local version to match the cluster's version?`,
          okText: 'Confirm',
          cancelText: 'Cancel',
          onOk: async () => {
            if (!doesSchemaExist(clusterSchemaVersion, userDataDir)) {
              await dispatch(downloadK8sSchema(clusterSchemaVersion));
            }

            if (activeProject) {
              dispatch(updateProjectK8sVersion(clusterSchemaVersion));
            } else {
              dispatch(updateK8sVersion(clusterSchemaVersion));
            }

            dispatch(setConfigK8sSchemaVersion(clusterSchemaVersion));
          },
        });
      } else if (clusterSchemaVersions.length > 1) {
        Modal.warning({
          title: 'Multiple Kubernetes versions detected',
          content: `There's a mismatch between the Kubernetes schema versions used by the nodes in "${currentContext}" cluster. Versions found: ${clusterSchemaVersions.join(
            ', '
          )}`,
        });
      }
    },
  });
};

export const validationListeners = [clusterK8sSchemaVersionListener, loadListener, validateListener];
