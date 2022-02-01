import _ from 'lodash';
import log from 'loglevel';
import {stringify} from 'yaml';

import {YAML_DOCUMENT_DELIMITER_NEW_LINE} from '@constants/constants';

import {AlertEnum, AlertType} from '@models/alert';
import {AppConfig} from '@models/appconfig';
import {AppDispatch} from '@models/appdispatch';
import {K8sResource} from '@models/k8sresource';

import {setAlert} from '@redux/reducers/alert';
import {applyYamlToCluster} from '@redux/thunks/applyYaml';

import {doesTextStartWithYamlDocumentDelimiter} from './resource';

const applyMultipleResources = (
  config: AppConfig,
  resourcesToApply: K8sResource[],
  dispatch: AppDispatch,
  namespace?: string,
  onSuccessCallback?: () => void
) => {
  const kubeConfigPath = config.projectConfig?.kubeConfig?.path || config.kubeConfig.path;
  const currentContext = config.projectConfig?.kubeConfig?.currentContext || config.kubeConfig.currentContext;

  if (!kubeConfigPath || !currentContext || !resourcesToApply.length) {
    return;
  }

  const yamlToApply = resourcesToApply
    .map(r => {
      const resourceContent = _.cloneDeep(r.content);
      if (r.namespace && r.namespace !== resourceContent.metadata.namespace) {
        delete resourceContent.metadata.namespace;
      }

      return stringify(resourceContent);
    })
    .reduce<string>((fullYaml, currentText) => {
      if (doesTextStartWithYamlDocumentDelimiter(currentText)) {
        return `${fullYaml}\n${currentText}`;
      }
      return `${fullYaml}\n${YAML_DOCUMENT_DELIMITER_NEW_LINE}${currentText}`;
    }, '');

  try {
    const child = applyYamlToCluster(yamlToApply, kubeConfigPath, currentContext, namespace);
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
        title: `Applied selected resources to cluster ${currentContext} successfully`,
        message: alertMessage,
      };

      if (onSuccessCallback) {
        onSuccessCallback();
      }

      dispatch(setAlert(alert));
    });

    child.stderr.on('data', data => {
      const alert: AlertType = {
        type: AlertEnum.Error,
        title: `Applying selected resources to cluster ${currentContext} failed`,
        message: data.toString(),
      };
      dispatch(setAlert(alert));
    });
  } catch (e) {
    log.error('Failed to apply selected resources');
    log.error(e);
  }
};

export default applyMultipleResources;
