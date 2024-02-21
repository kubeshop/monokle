import log from 'electron-log';

import {ChildProcessWithoutNullStreams, spawn} from 'child_process';

import type {ProxyLog} from '@shared/ipc';
import electronStore from '@shared/utils/electronStore';

import {Signal} from './signal';

type ProxyInit = {
  context: string;
  kubeconfig?: string;
  port: number;
  verbosity?: number;
};

const MAX_LOG_LENGTH = 30;

export class ProxyInstance {
  public readonly kubeconfig: string | undefined;
  public readonly context: string;
  public readonly port: number;
  public readonly verbosity?: number;

  public onDelete?: () => void;

  private _cmd?: string;
  private _process: ChildProcessWithoutNullStreams | undefined = undefined;
  private _logs: ProxyLog[] = []; // TODO rotating logs..

  constructor(init: ProxyInit) {
    this.context = init.context;
    this.port = init.port;
    this.kubeconfig = init.kubeconfig ?? undefined;
    this.verbosity = init.verbosity;
  }

  get active() {
    return this._process?.exitCode === null;
  }

  get debugInfo() {
    return {
      cmd: this._cmd ?? 'command never started',
      logs: this._logs,
    };
  }

  async start(): Promise<void> {
    if (this.context === '') {
      throw new Error('MONOKLE_PROXY_EMPTY_CONTEXT');
    }

    const globalOptions = [`--context=${JSON.stringify(this.context)}`];
    if (this.kubeconfig) globalOptions.push(`--kubeconfig=${JSON.stringify(this.kubeconfig)}`);
    if (this.verbosity) globalOptions.push(`-v=${this.verbosity}`);

    const proxyOptions = [`--port=${this.port}`];

    const shouldAppendServerPath = electronStore.get('kubeConfig.proxyOptions.appendServerPath');
    if (shouldAppendServerPath === undefined || shouldAppendServerPath === true) {
      log.info('[kubectl-proxy]: Append Server Path enabled.');
      proxyOptions.push('--append-server-path=true');
    }

    const proxySignal = new Signal();
    this._cmd = ['kubectl', ...globalOptions, 'proxy', ...proxyOptions].join(' ');
    this._process = spawn('kubectl', [...globalOptions, 'proxy', ...proxyOptions], {
      env: {
        ...process.env,
      },
      shell: true,
      windowsHide: true,
      detached: false,
    });

    this._process.on('exit', (code, signal) => {
      if (!proxySignal.isResolved) {
        proxySignal.reject(new Error('exit_before_resolve'));
      }

      this.log({
        type: 'exit',
        content: `Exited with code ${code}`,
        code,
        signal: signal?.toString(),
        timestamp: Date.now(),
      });

      this.onDelete?.();
    });

    this._process.stdout.on('data', data => {
      const msg = data?.toString() ?? '';

      if (msg.includes('Starting to serve on')) {
        proxySignal.resolve();
      }

      this.log({type: 'stdout', content: msg, timestamp: Date.now()});
    });

    this._process.stderr.on('data', data => {
      const msg = data?.toString() ?? '';

      if (!proxySignal.isResolved) {
        if (
          msg.includes('bind: address already in use') ||
          msg.includes(
            'bind: Only one usage of each socket address (protocol/network address/port) is normally permitted'
          )
        ) {
          proxySignal.reject(new Error('EADDRINUSE'));
        } else if (msg.includes('error: The gcp auth plugin has been removed')) {
          proxySignal.reject(new Error('MONOKLE_PROXY_GCP_LEGACY_PLUGIN'));
        } else {
          // do nothing and let the timeout reject eventually.
          // For instance, high verbosity logs plenty of details
          // to stdout which should not reject.
        }
      }

      this.log({type: 'stderr', content: msg, timestamp: Date.now()});
    });

    // This Should be handled by an exit or stdout event?
    // if (proxyProcess.pid === undefined) {
    //   throw new Error("cannot_start_proxy"); // TODO handle better
    // }

    await Promise.race([proxySignal.promise, timeout(1500)]);
  }

  private log(entry: ProxyLog) {
    log.info('[kubectl-proxy]', entry);
    this._logs.push(entry);
    if (this._logs.length > MAX_LOG_LENGTH) this._logs.shift();
  }

  stop() {
    log.info('[kubectl-proxy] STOP', this._process?.pid);
    if (!this._process || !this._process.pid) {
      return;
    }

    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', this._process.pid.toString(), '/f', '/t']);
    } else {
      this._process.kill();
    }
  }
}

function timeout(ms: number) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('MONOKLE_PROXY_TIMEOUT'));
    }, ms);
  });
}
