import _ from 'lodash';
import log from 'loglevel';
import {stringify} from 'yaml';

import {YAML_DOCUMENT_DELIMITER_NEW_LINE} from '@constants/constants';

import {AlertEnum, AlertType} from '@models/alert';
import {AppConfig} from '@models/appconfig';
import {AppDispatch} from '@models/appdispatch';
import {K8sResource} from '@models/k8sresource';

import {setAlert} from '@redux/reducers/alert';
import {doesTextStartWithYamlDocumentDelimiter} from '@redux/services/resource';
import {applyYamlToCluster} from '@redux/thunks/applyYaml';
import {removeNamespaceFromCluster} from '@redux/thunks/utils';

const applyMultipleResources = (
  config: AppConfig,
  resourcesToApply: K8sResource[],
  dispatch: AppDispatch,
  namespace?: {name: string; new: boolean},
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
      if (namespace && namespace.name !== resourceContent.metadata?.namespace) {
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

      if (namespace && namespace.new) {
        const namespaceAlert: AlertType = {
          type: AlertEnum.Success,
          title: `Created ${namespace.name} namespace to cluster ${currentContext} successfully`,
          message: '',
        };

        dispatch(setAlert(namespaceAlert));
      }

      const alert: AlertType = {
        type: AlertEnum.Success,
        title: `Applied selected resources to cluster ${currentContext} successfully`,
        message: alertMessage,
      };

      if (onSuccessCallback) {
        onSuccessCallback();
      }

      setTimeout(() => dispatch(setAlert(alert)), 400);
    });

    child.stderr.on('data', async data => {
      const alert: AlertType = {
        type: AlertEnum.Error,
        title: `Applying selected resources to cluster ${currentContext} failed`,
        message: data.toString(),
      };

      if (namespace && namespace.new) {
        await removeNamespaceFromCluster(namespace.name, kubeConfigPath, currentContext);
      }

      dispatch(setAlert(alert));
    });
  } catch (e) {
    log.error('Failed to apply selected resources');
    log.error(e);
  }
};

export default applyMultipleResources;
