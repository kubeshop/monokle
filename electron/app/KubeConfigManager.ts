import {UtilityProcess, app, utilityProcess} from 'electron';

import log from 'loglevel';
import path from 'path';
import {AnyAction} from 'redux';

import {AlertEnum} from '@shared/models/alert';
import electronStore from '@shared/utils/electronStore';
import {getKubeAccess} from '@shared/utils/kubeclient';

import {dispatchToAllWindows} from './ipc/ipcMainRedux';

let kubeServiceProcess: UtilityProcess | null = null;

export const startKubeConfigService = () => {
  if (kubeServiceProcess) {
    kubeServiceProcess.kill();
  }

  kubeServiceProcess = utilityProcess.fork(path.normalize(`${__dirname}/KubeConfigService.js`), [
    electronStore.get('appConfig.kubeConfig') || '',
    process.env.KUBECONFIG || '',
    electronStore.get('appConfig.kubeconfig') || '',
    path.join(app.getPath('home'), `${path.sep}.kube${path.sep}config`),
  ]);

  kubeServiceProcess.on('message', handleKubeServiceMessage);

  kubeServiceProcess.on('exit', () => {
    log.info('stop: watching cluster namespaces resources');
  });

  kubeServiceProcess.on('spawn', () => {
    log.info('start: watching cluster namespaces resources');
  });
};

export const stopKubeConfigService = () => {
  if (kubeServiceProcess) {
    kubeServiceProcess.kill();
  }
};

const handleKubeServiceMessage = (message: AnyAction) => {
  if (message.type) {
    dispatchToAllWindows(message);
    return;
  }

  if (message.event && message.event === 'watch/ObjectAdded') {
    getKubeAccess(message.objectName, message.context)
      .then(clusterAccess => {
        dispatchToAllWindows({type: 'config/setKubeConfig', payload: message.payload});
        dispatchToAllWindows({type: 'config/setAccessLoading', payload: true});
        dispatchToAllWindows({type: 'config/addNamespaceToContext', payload: clusterAccess});
      })
      .catch(() => {
        dispatchToAllWindows({
          type: 'alert/setAlert',
          payload: {
            type: AlertEnum.Warning,
            title: 'Cluster Watcher Error',
            message:
              "We're unable to watch for namespaces changes in your cluster. This may be due to a lack of permissions.",
          },
        });
        dispatchToAllWindows({type: 'config/setAccessLoading', payload: false});
      });
  }
};
