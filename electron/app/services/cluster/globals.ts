import {ProxyService} from '../../../kubernetes/ProxyService';
import {KubeConfigWatcher} from './daemons/kubeconfigWatcher';

export const PROXY_SERVICE = new ProxyService();
export const KUBE_CONFIG_WATCHER = new KubeConfigWatcher();
