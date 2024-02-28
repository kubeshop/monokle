import {ProxyInstance} from './ProxyInstance';

const PROXY_MAX_ATTEMPTS = 25;

export class ProxyService {
  private nextPort = 30001;
  private proxies: ProxyInstance[] = [];
  private last: ProxyInstance | undefined;

  get(context: string, kubeconfig?: string): Promise<ProxyInstance> {
    const proxy = this.proxies.find(p => p.context === context && p.kubeconfig === kubeconfig);

    if (proxy) {
      if (proxy.active) {
        // Proxy running so all good.
        return Promise.resolve(proxy);
      }
      // Something went wrong! Let's stop and restart.
      this.stop(proxy);
    }

    return this.start(context, kubeconfig);
  }

  async getLast(): Promise<ProxyInstance | undefined> {
    return this.last;
  }

  find(context: string) {
    return this.proxies.find(p => p.context === context);
  }

  private async start(context: string, kubeconfig?: string): Promise<ProxyInstance> {
    let attempt = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const port = this.nextPort;
        this.nextPort += 1;

        const proxy = new ProxyInstance({context, kubeconfig, port, verbosity: undefined});
        this.last = proxy;
        await proxy.start();

        proxy.onDelete = () => {
          this.proxies = this.proxies.filter(p => p.context === proxy.context && p.kubeconfig === proxy.kubeconfig);
        };

        this.proxies.push(proxy);
        return proxy;
      } catch (err) {
        if (attempt >= PROXY_MAX_ATTEMPTS) {
          throw err;
        }

        attempt += 1;

        const reason = err instanceof Error ? err.message : 'reason_unknown';
        if (reason.includes('EADDRINUSE')) {
          continue; // retry with new incremented port number.
        }

        throw err;
      }
    }
  }

  stop(proxy: ProxyInstance) {
    proxy.stop();
    this.proxies = this.proxies.filter(p => p.context === proxy.context && p.kubeconfig === proxy.kubeconfig);
  }

  stopAll() {
    this.proxies.forEach(proxy => {
      this.stop(proxy);
    });
  }
}
