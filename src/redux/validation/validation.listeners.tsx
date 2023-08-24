import {Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import {isAnyOf} from '@reduxjs/toolkit';

import {isEmpty, size, uniqWith} from 'lodash';
import log from 'loglevel';

import {
  activeProjectSelector,
  currentConfigSelector,
  kubeConfigContextSelector,
  updateK8sVersion,
  updateProjectK8sVersion,
} from '@redux/appConfig';
import {AppListenerFn} from '@redux/listeners/base';
import {
  addMultipleResources,
  addResource,
  deleteMultipleClusterResources,
  multiplePathsRemoved,
  updateMultipleClusterResources,
} from '@redux/reducers/main';
import {setIsInQuickClusterMode} from '@redux/reducers/ui';
import {getResourceMapFromState} from '@redux/selectors/resourceMapGetters';
import {loadClusterResources, reloadClusterResources, stopClusterConnection} from '@redux/thunks/cluster';
import {downloadK8sSchema} from '@redux/thunks/downloadK8sSchema';
import {multiplePathsAdded} from '@redux/thunks/multiplePathsAdded';
import {multiplePathsChanged} from '@redux/thunks/multiplePathsChanged';
import {
  previewHelmValuesFile,
  previewKustomization,
  previewSavedCommand,
  restartPreview,
  stopPreview,
} from '@redux/thunks/preview';
import {removeResources} from '@redux/thunks/removeResources';
import {runPreviewConfiguration} from '@redux/thunks/runPreviewConfiguration';
import {setRootFolder} from '@redux/thunks/setRootFolder';
import {updateFileEntry} from '@redux/thunks/updateFileEntry';
import {updateMultipleResources} from '@redux/thunks/updateMultipleResources';
import {updateResource} from '@redux/thunks/updateResource';

import {startExecutionTimer} from '@utils/executionTime';
import {doesSchemaExist} from '@utils/index';

import {ResourceIdentifier, ResourceStorage} from '@shared/models/k8sResource';
import {isDefined} from '@shared/utils/filter';
import {isEqual} from '@shared/utils/isEqual';
import {trackEvent} from '@shared/utils/telemetry';

import {pollCloudPolicy} from './validation.hooks';
import {
  addValidationPlugin,
  changeRuleLevel,
  removeValidationPlugin,
  setConfigK8sSchemaVersion,
  toggleRule,
  toggleValidation,
} from './validation.slice';
import {loadValidation, validateResources} from './validation.thunks';

type IncrementalValidationStatus = {
  isRunning: boolean;
  nextBatch: ResourceIdentifier[];
  abortController?: AbortController;
};

let incrementalValidationStatus: IncrementalValidationStatus = {
  isRunning: false,
  nextBatch: [],
};

const pullCloudPolicyListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(setRootFolder.fulfilled),
    async effect(_action, {getState, dispatch}) {
      pollCloudPolicy(getState(), dispatch);
    },
  });
};

const loadListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(
      setIsInQuickClusterMode,
      setRootFolder.fulfilled,
      updateProjectK8sVersion,
      toggleRule,
      toggleValidation,
      changeRuleLevel,
      addValidationPlugin,
      removeValidationPlugin
    ),
    async effect(_action, {dispatch, delay, signal, cancelActiveListeners}) {
      trackEvent('validation/load_config', {actionType: _action.type});
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
      stopClusterConnection.fulfilled,
      removeResources.fulfilled,
      deleteMultipleClusterResources,
      multiplePathsRemoved,
      previewKustomization.fulfilled,
      previewKustomization.rejected,
      previewHelmValuesFile.fulfilled,
      previewHelmValuesFile.rejected,
      runPreviewConfiguration.fulfilled,
      runPreviewConfiguration.rejected,
      previewSavedCommand.fulfilled,
      previewSavedCommand.rejected,
      stopPreview.fulfilled,
      stopPreview.rejected,
      restartPreview.fulfilled,
      restartPreview.rejected
    ),
    async effect(_action, {dispatch, getState, cancelActiveListeners, signal, delay}) {
      const stopExecutionTimer = startExecutionTimer();
      cancelActiveListeners();

      if (incrementalValidationStatus.isRunning) {
        incrementalValidationStatus.abortController?.abort();
        incrementalValidationStatus.abortController = undefined;
        incrementalValidationStatus.isRunning = false;
      }

      const validatorsLoading = getState().validation.status === 'loading';
      if (validatorsLoading) return;

      await delay(1);
      if (signal.aborted) return;

      if (isAnyOf(runPreviewConfiguration.fulfilled, runPreviewConfiguration.rejected)(_action)) {
        // if runPreviewConfiguration was used to perform a deploy and not a preview
        // then, we don't have to revalidate
        if (_action.meta.arg.performDeploy) {
          return;
        }
      }

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
          stopPreview.fulfilled,
          stopPreview.rejected,
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

      trackEvent('validation/validate_all', {
        actionType: _action.type,
        resourcesCount: resourceStorage ? size(getState().main.resourceMetaMapByStorage[resourceStorage]) : 0,
        executionTime: stopExecutionTimer(),
      });
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
      updateMultipleClusterResources,
      updateFileEntry.fulfilled,
      multiplePathsAdded.fulfilled,
      multiplePathsChanged.fulfilled
    ),
    async effect(_action, {dispatch, delay, signal}) {
      const stopExecutionTimer = startExecutionTimer();
      let resourceIdentifiers: ResourceIdentifier[] = [];

      if (
        isAnyOf(
          updateResource.fulfilled,
          updateMultipleResources.fulfilled,
          updateFileEntry.fulfilled,
          multiplePathsAdded.fulfilled,
          multiplePathsChanged.fulfilled
        )(_action)
      ) {
        resourceIdentifiers = _action.payload.affectedResourceIdentifiers ?? [];
      }

      if (isAnyOf(addResource)(_action)) {
        resourceIdentifiers = [_action.payload];
      }

      if (isAnyOf(addMultipleResources, updateMultipleClusterResources)(_action)) {
        resourceIdentifiers = _action.payload;
      }

      if (resourceIdentifiers.length === 0) return;

      if (incrementalValidationStatus.isRunning) {
        incrementalValidationStatus.nextBatch.push(...resourceIdentifiers);
        log.info('Incremental validation is already running, adding to the next batch', resourceIdentifiers);
        return;
      }

      await delay(1);
      if (signal.aborted) return;

      resourceIdentifiers = uniqWith([...resourceIdentifiers, ...incrementalValidationStatus.nextBatch], isEqual);
      incrementalValidationStatus = {
        isRunning: true,
        nextBatch: [],
        abortController: new AbortController(),
      };

      const response = dispatch(validateResources({type: 'incremental', resourceIdentifiers}));
      signal.addEventListener('abort', () => response.abort());
      incrementalValidationStatus.abortController?.signal.addEventListener('abort', () => response.abort());
      await response;

      if (!isAnyOf(updateMultipleClusterResources)(_action)) {
        trackEvent('validation/validate_incremental', {
          actionType: _action.type,
          resourcesCount: resourceIdentifiers.length,
          executionTime: stopExecutionTimer(),
        });
      }

      incrementalValidationStatus.isRunning = false;
      incrementalValidationStatus.abortController = undefined;
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
  pullCloudPolicyListener,
];
