import path from 'path';
import {PROCESS_ENV} from '@utils/env';
import {AlertEnum} from '@models/alert';
import electronStore from '@utils/electronStore';
import {setKubeconfig} from '@redux/reducers/appConfig';
import {setAlert} from '@redux/reducers/alert';

function initKubeconfig(store: any, userHomeDir: string) {
  if (PROCESS_ENV.KUBECONFIG) {
    const envKubeconfigParts = PROCESS_ENV.KUBECONFIG.split(path.delimiter);
    if (envKubeconfigParts.length > 1) {
      store.dispatch(setKubeconfig(envKubeconfigParts[0]));
      store.dispatch(
        setAlert({
          title: 'KUBECONFIG warning',
          message: 'Found multiple configs, selected the first one.',
          type: AlertEnum.Warning,
        })
      );
    } else {
      store.dispatch(setKubeconfig(PROCESS_ENV.KUBECONFIG));
    }
    return;
  }
  const storedKubeconfig: string | undefined = electronStore.get('appConfig.kubeconfig');
  if (storedKubeconfig && storedKubeconfig.trim().length > 0) {
    store.dispatch(setKubeconfig(storedKubeconfig));
    return;
  }
  store.dispatch(setKubeconfig(path.join(userHomeDir, `${path.sep}.kube${path.sep}config`)));
}

export default initKubeconfig;
