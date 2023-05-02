import {handleIpc} from '../../utils/ipc';
import {debugProxy, getKubeConfig, setup, stopWatchingKubeconfig, watchKubeconfig} from './handlers';

// Cluster & Proxy management
handleIpc('cluster:setup', setup);
handleIpc('cluster:debug-proxy', debugProxy);

// Kubeconfig management
handleIpc('kubeconfig:get', getKubeConfig);
handleIpc('kubeconfig:watch', watchKubeconfig);
handleIpc('kubeconfig:watch:stop', stopWatchingKubeconfig);
