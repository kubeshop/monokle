import {KUBE_CONFIG_WATCHER} from '../../globals';

export function watchKubeconfig(params: {kubeconfigs: string[]}) {
  return KUBE_CONFIG_WATCHER.watch(params.kubeconfigs);
}

export function stopWatchingKubeconfig() {
  KUBE_CONFIG_WATCHER.stop();
}
