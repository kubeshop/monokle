import {Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import {isAnyOf} from '@reduxjs/toolkit';

import {isEmpty} from 'lodash';

import {
  activeProjectSelector,
  currentConfigSelector,
  kubeConfigContextSelector,
  updateK8sVersion,
  updateProjectK8sVersion,
} from '@redux/appConfig';
import {AppListenerFn} from '@redux/listeners/base';
import {addMultipleResources, addResource, clearPreview, clearPreviewAndSelectionHistory} from '@redux/reducers/main';
import {setIsInQuickClusterMode} from '@redux/reducers/ui';
import {getResourceMapFromState} from '@redux/selectors/resourceMapGetters';
import {previewSavedCommand} from '@redux/services/previewCommand';
import {loadClusterResources, reloadClusterResources, stopClusterConnection} from '@redux/thunks/cluster';
import {downloadK8sSchema} from '@redux/thunks/downloadK8sSchema';
import {multiplePathsAdded} from '@redux/thunks/multiplePathsAdded';
import {multiplePathsChanged} from '@redux/thunks/multiplePathsChanged';
import {previewHelmValuesFile} from '@redux/thunks/previewHelmValuesFile';
import {previewKustomization} from '@redux/thunks/previewKustomization';
import {removeResources} from '@redux/thunks/removeResources';
import {runPreviewConfiguration} from '@redux/thunks/runPreviewConfiguration';
import {setRootFolder} from '@redux/thunks/setRootFolder';
import {updateFileEntry} from '@redux/thunks/updateFileEntry';
import {updateMultipleResources} from '@redux/thunks/updateMultipleResources';
import {updateResource} from '@redux/thunks/updateResource';

import {doesSchemaExist} from '@utils/index';

import {ResourceIdentifier, ResourceStorage} from '@shared/models/k8sResource';
import {isDefined} from '@shared/utils/filter';
import {isEqual} from '@shared/utils/isEqual';

import {changeRuleLevel, setConfigK8sSchemaVersion, toggleRule, toggleValidation} from './validation.slice';
import {loadValidation, validateResources} from './validation.thunks';

const loadListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(
      setIsInQuickClusterMode,
      setRootFolder.fulfilled,
      updateProjectK8sVersion,
      toggleRule,
      toggleValidation,
      changeRuleLevel
    ),
    async effect(_action, {dispatch, delay, signal, cancelActiveListeners}) {
      if (isAnyOf(setIsInQuickClusterMode)(_action)) {
        if (!_action.payload) {
          return;
        }
      }
      cancelActiveListeners();
      await delay(1);
      const loading = dispatch(loadValidation());
      signal.addEventListener('abort', () => loading.abort());
      await loading;
    },
  });
};

// TODO: should we have a separate listener for each resource storage?
// for example I'm thinking that a preview might cancel the validation of the cluster
const validateListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(
      loadValidation.fulfilled,
      loadClusterResources.fulfilled,
      reloadClusterResources.fulfilled,
      previewKustomization.fulfilled,
      previewHelmValuesFile.fulfilled,
      runPreviewConfiguration.fulfilled,
      previewSavedCommand.fulfilled,
      previewKustomization.rejected,
      previewHelmValuesFile.rejected,
      runPreviewConfiguration.rejected,
      previewSavedCommand.rejected,
      stopClusterConnection.fulfilled,
      clearPreviewAndSelectionHistory,
      clearPreview
    ),
    async effect(_action, {dispatch, getState, cancelActiveListeners, signal, delay}) {
      if (_action.type === 'main/clearPreviewAndSelectionHistory' && _action.payload.revalidate === false) {
        return;
      }

      cancelActiveListeners();

      const validatorsLoading = getState().validation.status === 'loading';
      if (validatorsLoading) return;

      await delay(1);
      if (signal.aborted) return;

      let resourceStorage: ResourceStorage | undefined;

      if (isAnyOf(loadClusterResources.fulfilled, reloadClusterResources.fulfilled)(_action)) {
        resourceStorage = 'cluster';
      }

      if (
        isAnyOf(
          previewKustomization.fulfilled,
          previewHelmValuesFile.fulfilled,
          runPreviewConfiguration.fulfilled,
          previewSavedCommand.fulfilled
        )(_action)
      ) {
        resourceStorage = 'preview';
      }

      if (
        isAnyOf(
          stopClusterConnection.fulfilled,
          clearPreviewAndSelectionHistory,
          clearPreview,
          previewKustomization.rejected,
          previewHelmValuesFile.rejected,
          runPreviewConfiguration.rejected,
          previewSavedCommand.rejected
        )(_action)
      ) {
        resourceStorage = 'local';
      }

      const response = dispatch(validateResources({type: 'full', resourceStorage}));
      signal.addEventListener('abort', () => response.abort());
      await response;
    },
  });
};

const incrementalValidationListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(
      addResource,
      addMultipleResources,
      updateResource.fulfilled,
      updateMultipleResources.fulfilled,
      updateFileEntry.fulfilled,
      removeResources.fulfilled,
      multiplePathsAdded.fulfilled,
      multiplePathsChanged.fulfilled
    ),
    async effect(_action, {dispatch, delay, signal}) {
      let resourceIdentifiers: ResourceIdentifier[] = [];

      if (
        isAnyOf(
          updateResource.fulfilled,
          updateMultipleResources.fulfilled,
          updateFileEntry.fulfilled,
          removeResources.fulfilled,
          multiplePathsAdded.fulfilled,
          multiplePathsChanged.fulfilled
        )(_action)
      ) {
        resourceIdentifiers = _action.payload.affectedResourceIdentifiers ?? [];
      }

      if (isAnyOf(addResource)(_action)) {
        resourceIdentifiers = [_action.payload];
      }

      if (isAnyOf(addMultipleResources)(_action)) {
        resourceIdentifiers = _action.payload;
      }

      if (resourceIdentifiers.length === 0) return;

      // TODO: should we cancel active listeners or not?
      // I think it depends on the resource storage?
      // but maybe validation should actually be cancelled while the processing of refs should not?!
      // cancelActiveListeners();

      await delay(200);
      if (signal.aborted) return;
      const response = dispatch(validateResources({type: 'incremental', resourceIdentifiers}));
      signal.addEventListener('abort', () => response.abort());
      await response;
    },
  });
};

// TODO: this should be moved to a different file / folder related to cluster interactions or related to schemas
const clusterK8sSchemaVersionListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(loadClusterResources.fulfilled),
    async effect(_, {dispatch, getState, cancelActiveListeners, delay}) {
      cancelActiveListeners();
      await delay(1);

      const state = getState();

      const activeProject = activeProjectSelector(state);
      const clusterResourceMap = getResourceMapFromState(state, 'cluster');
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

export const validationListeners = [
  clusterK8sSchemaVersionListener,
  loadListener,
  validateListener,
  incrementalValidationListener,
];
