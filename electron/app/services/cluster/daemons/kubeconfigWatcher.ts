import * as k8s from '@kubernetes/client-node';

import {BrowserWindow} from 'electron';

import {FSWatcher, watch} from 'chokidar';
import fs from 'fs/promises';
import {uniq} from 'lodash';

import {InvalidKubeConfig, ValidKubeConfig} from '@shared/models/config';

import {getDefaultKubeConfig} from '../utils/getDefaultKubeConfig';

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
        // Dispatch events a first time.
        this.parse(kubeconfig);
      }
    }

    // Already existing watchers.
    for (const kubeconfig of newKubeconfigs) {
      const alreadyExists = oldKubeconfigs.includes(kubeconfig);

      if (alreadyExists) {
        // Dispatch events once more to ensure proper state.
        this.parse(kubeconfig);
      }
    }
  }

  private async watchFile(kubeconfigPath: string) {
    try {
      const stats = await fs.stat(kubeconfigPath);

      if (!stats.isFile()) {
        this.broadcastError(kubeconfigPath, 'not_found');
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

        this.parse(kubeconfigPath);
      });
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.log('monitorKubeConfigError', e.message);
      this.broadcastError(kubeconfigPath, 'unknown');
    }
  }

  private parse(kubeconfigPath: string) {
    try {
      const config = new k8s.KubeConfig();
      config.loadFromFile(kubeconfigPath);
      this.broadcastSuccess(kubeconfigPath, config);
    } catch {
      this.broadcastError(kubeconfigPath, 'malformed');
    }
  }

  private broadcastSuccess(kubeconfigPath: string, config: k8s.KubeConfig) {
    const kc: ValidKubeConfig = {
      path: kubeconfigPath,
      isValid: true,
      currentContext: config.getCurrentContext(),
      contexts: config.getContexts(),
      clusters: config.getClusters(),
      users: config.getUsers(),
    };

    BrowserWindow.getAllWindows().forEach(w => w.webContents.send('kubeconfig:update', kc));
  }

  private broadcastError(kubeconfigPath: string, reason: string) {
    const kc: InvalidKubeConfig = {
      isValid: false,
      path: kubeconfigPath,
      reason,
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
