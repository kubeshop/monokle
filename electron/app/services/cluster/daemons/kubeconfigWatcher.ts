import * as k8s from '@kubernetes/client-node';

import {BrowserWindow} from 'electron';

import {FSWatcher, watch} from 'chokidar';
import fs from 'fs-extra';
import {uniq} from 'lodash';
import log from 'loglevel';

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
        const success = await this.watchFile(kubeconfig);

        if (success) {
          // Dispatch events a first time.
          this.parse(kubeconfig);
        }
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

  private async watchFile(kubeconfigPath: string): Promise<boolean> {
    try {
      const pathExists = await fs.pathExists(kubeconfigPath);

      if (!pathExists) {
        this.broadcastError({
          path: kubeconfigPath,
          code: 'not_found',
          reason: 'There is no kubeconfig found here.',
        });
        return false;
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
          this.broadcastError({
            path: kubeconfigPath,
            code: 'not_found',
            reason: `The kubeconfig file is deleted.`,
          });
          return;
        }

        this.parse(kubeconfigPath);
      });

      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown problem';
      this.broadcastError({
        path: kubeconfigPath,
        code: 'unknown',
        reason: `The kubeconfig has a problem: ${msg}`,
      });
      return false;
    }
  }

  private parse(kubeconfigPath: string) {
    try {
      const config = new k8s.KubeConfig();
      config.loadFromFile(kubeconfigPath);
      this.broadcastSuccess(kubeconfigPath, config);
    } catch (err) {
      const msg = err instanceof Error ? err.message : undefined;
      this.broadcastError({
        path: kubeconfigPath,
        code: 'malformed',
        reason: `The kubeconfig is incorrectly formatted${msg ? `: ${msg}` : ''}.`,
      });
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

  private broadcastError(config: Omit<InvalidKubeConfig, 'isValid'>) {
    log.warn('[kubeconfig-watcher] error', config.path, config.code);
    const kc: InvalidKubeConfig = {
      isValid: false,
      ...config,
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
