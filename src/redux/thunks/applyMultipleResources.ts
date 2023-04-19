import _ from 'lodash';
import log from 'loglevel';

import {YAML_DOCUMENT_DELIMITER_NEW_LINE} from '@constants/constants';

import {setAlert} from '@redux/reducers/alert';
import {doesTextStartWithYamlDocumentDelimiter} from '@redux/services/resource';
import {applyYamlToCluster} from '@redux/thunks/applyYaml';
import {removeNamespaceFromCluster} from '@redux/thunks/utils';

import {stringifyK8sResource} from '@utils/yaml';

import {AlertEnum, AlertType} from '@shared/models/alert';
import {AppDispatch} from '@shared/models/appDispatch';
import {AppConfig} from '@shared/models/config';
import {K8sResource} from '@shared/models/k8sResource';

const applyMultipleResources = async (
  config: AppConfig,
  resourcesToApply: K8sResource[],
  dispatch: AppDispatch,
  namespace?: {name: string; new: boolean},
  onSuccessCallback?: () => void
) => {
  const kubeConfigPath = config.kubeConfig.path;
  const currentContext = config.kubeConfig.currentContext;

  if (!kubeConfigPath || !currentContext || !resourcesToApply.length) {
    return;
  }

  const yamlToApply = resourcesToApply
    .map(r => {
      const resourceObject = _.cloneDeep(r.object);
      if (namespace && namespace.name !== resourceObject.metadata?.namespace) {
        delete resourceObject.metadata.namespace;
      }

      return stringifyK8sResource(resourceObject);
    })
    .reduce<string>((fullYaml, currentText) => {
      if (doesTextStartWithYamlDocumentDelimiter(currentText)) {
        return `${fullYaml}\n${currentText}`;
      }
      return `${fullYaml}\n${YAML_DOCUMENT_DELIMITER_NEW_LINE}${currentText}`;
    }, '');

  try {
    const result = await applyYamlToCluster({
      yaml: yamlToApply,
      kubeconfig: kubeConfigPath,
      context: currentContext,
      namespace,
    });
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
