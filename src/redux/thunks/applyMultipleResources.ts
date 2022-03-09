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
import {removeNamespaceFromCluster} from '@redux/thunks/utils';

import {doesTextStartWithYamlDocumentDelimiter} from './resource';

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
    const result = await applyYamlToCluster(yamlToApply, kubeConfigPath, currentContext, namespace);
    log.info(`kubectl exited with code ${result.exitCode} and signal ${result.signal}`);

    if (result.stdout) {
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
        message: result.stdout,
      };

      if (onSuccessCallback) {
        onSuccessCallback();
      }

      setTimeout(() => dispatch(setAlert(alert)), 400);
    }
    if (result.stderr) {
      const alert: AlertType = {
        type: AlertEnum.Error,
        title: `Applying selected resources to cluster ${currentContext} failed`,
        message: result.stderr,
      };

      if (namespace && namespace.new) {
        await removeNamespaceFromCluster(namespace.name, kubeConfigPath, currentContext);
      }

      dispatch(setAlert(alert));
    }
  } catch (e) {
    log.error('Failed to apply selected resources');
    log.error(e);
  }
};

export default applyMultipleResources;
