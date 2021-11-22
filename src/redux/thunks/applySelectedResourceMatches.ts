import {createAsyncThunk} from '@reduxjs/toolkit';

import log from 'loglevel';

import {YAML_DOCUMENT_DELIMITER_NEW_LINE} from '@constants/constants';

import {AlertEnum, AlertType} from '@models/alert';
import {K8sResource} from '@models/k8sresource';

import {setAlert} from '@redux/reducers/alert';
import {reloadClusterDiff} from '@redux/reducers/main';
import {doesTextStartWithYamlDocumentDelimiter} from '@redux/services/resource';
import {AppDispatch, RootState} from '@redux/store';

import {applyYamlToCluster} from './applyYaml';

export const applySelectedResourceMatches = createAsyncThunk<
  void,
  undefined,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/applySelectedResourceMatches', async (_, thunkAPI) => {
  const state = thunkAPI.getState();

  const kubeconfigPath = state.config.kubeconfigPath;
  const context = state.config.kubeConfig.currentContext;
  const matches = state.main.clusterDiff.clusterToLocalResourcesMatches;
  const resourceMap = state.main.resourceMap;
  const selectedMatches = state.main.clusterDiff.selectedMatches;

  if (!kubeconfigPath || !context || selectedMatches.length === 0) {
    return;
  }

  const resourcesToApply = matches
    .filter(match => selectedMatches.includes(match.id))
    .map(match =>
      match.localResourceIds && match.localResourceIds.length > 0 ? resourceMap[match.localResourceIds[0]] : undefined
    )
    .filter((r): r is K8sResource => r !== undefined);

  const yamlToApply = resourcesToApply
    .map(r => r.text)
    .reduce<string>((fullYaml, currentText) => {
      if (doesTextStartWithYamlDocumentDelimiter(currentText)) {
        return `${fullYaml}\n${currentText}`;
      }
      return `${fullYaml}\n${YAML_DOCUMENT_DELIMITER_NEW_LINE}${currentText}`;
    }, '');

  try {
    const child = applyYamlToCluster(yamlToApply, kubeconfigPath, context);
    child.on('exit', (code, signal) => {
      log.info(`kubectl exited with code ${code} and signal ${signal}`);
    });

    let alertMessage: string = '';

    child.stdout.on('data', data => {
      alertMessage += `\n${data.toString()}`;
    });

    child.stdout.on('end', () => {
      const alert: AlertType = {
        type: AlertEnum.Success,
        title: `Applied selected resources to cluster ${context} successfully`,
        message: alertMessage,
      };
      thunkAPI.dispatch(reloadClusterDiff());
      thunkAPI.dispatch(setAlert(alert));
    });

    child.stderr.on('data', data => {
      const alert: AlertType = {
        type: AlertEnum.Error,
        title: `Applying selected resources to cluster ${context} failed`,
        message: data.toString(),
      };
      thunkAPI.dispatch(setAlert(alert));
    });
  } catch (e) {
    log.error('Failed to apply selected resources');
    log.error(e);
  }
});
