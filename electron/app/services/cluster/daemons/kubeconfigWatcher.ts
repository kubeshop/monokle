import * as k8s from '@kubernetes/client-node';

import {BrowserWindow} from 'electron';

import {FSWatcher, watch} from 'chokidar';
import fs from 'fs/promises';
import {uniq} from 'lodash';

import {ModernKubeConfig} from '@shared/models/config';

import {getDefaultKubeConfig} from '../utils/getDefaultKubeConfig';

// TODO: validate whether this only dispatches when there are
// no changes to avoid unnecessary dispatches in renderer.
// TODO: Dispatch delete event so slices can remove stale kubeconfigs.
export class KubeConfigWatcher {
  private watchers: Map<string, FSWatcher> = new Map();

  async watch(kubeconfigs: string[]): Promise<void> {
    const newKubeconfigs = uniq([getDefaultKubeConfig(), ...kubeconfigs]);
    const oldKubeconfigs = [...this.watchers.keys()];

    // Delete removed watchers.
    for (const kubeconfig of oldKubeconfigs) {
      const shouldDelete = !newKubeconfigs.includes(kubeconfig);

      if (shouldDelete) {
        await this.stopOne(kubeconfig);
      }
    }

    // Create added watchers.
    for (const kubeconfig of newKubeconfigs) {
      const shouldAdd = !oldKubeconfigs.includes(kubeconfig);

      if (shouldAdd) {
        await this.watchFile(kubeconfig);
      }
    }
  }

  private async watchFile(kubeconfigPath: string) {
    try {
      const stats = await fs.stat(kubeconfigPath);

      if (!stats.isFile()) {
        return;
      }

      const watcher = watch(kubeconfigPath, {
        persistent: true,
        usePolling: true,
        interval: 1000,
        ignoreInitial: true,
      });

      this.watchers.set(kubeconfigPath, watcher);

      watcher?.on('all', (type: string) => {
        if (type === 'unlink') {
          watcher?.close();
          process.parentPort.postMessage({type: 'config/setKubeConfig', payload: undefined});
          return;
        }

        const config = new k8s.KubeConfig();
        config.loadFromFile(kubeconfigPath);
        this.broadcast(kubeconfigPath, config);
      });

      // Run once manually to get started
      const config = new k8s.KubeConfig();
      config.loadFromFile(kubeconfigPath);
      this.broadcast(kubeconfigPath, config);
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.log('monitorKubeConfigError', e.message);
    }
  }

  private broadcast(kubeconfigPath: string, config: k8s.KubeConfig) {
    const kc: ModernKubeConfig = {
      path: kubeconfigPath,
      currentContext: config.getCurrentContext(),
      contexts: config.getContexts(),
      clusters: config.getClusters(),
      users: config.getUsers(),
    };

    BrowserWindow.getAllWindows().forEach(w => w.webContents.send('kubeconfig:update', kc));
  }

  async stop(): Promise<void> {
    for (const kubeconfig of this.watchers.keys()) {
      await this.stopOne(kubeconfig);
    }
  }

  private async stopOne(kubeconfig: string): Promise<void> {
    const watcher = this.watchers.get(kubeconfig);
    if (!watcher) return;
    await watcher.close();
    this.watchers.delete(kubeconfig);
  }
}
