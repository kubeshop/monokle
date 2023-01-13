Welcome to the Monokle troubleshooting guide for cluster connections. This page will provide you with steps to help you resolve any issues you may be experiencing when connecting to your Kubernetes clusters through the Monokle app.

Troubleshooting Steps:

1. Using the Proxy setting in Monokle 
    - Within the Monokle application, navigate to the Settings panel and go to the "Global Settings" section. 
    - Click on the checkbox for "Enable Proxy". 
    - This setting will start a proxy to the Kubernetes API server before connecting to the cluster, which can be helpful for advanced authentication setups.

2. Starting a Proxy server manually
    - If the proxy setting does not resolve the issue, you can try using a proxy manually. 
    - To do this, run the command "kubectl proxy --port=**PROXY_PORT**" in a terminal, replacing **PROXY_PORT** with the port you would like to open the proxy on. 
    - Next, create a kubeconfig file in any location on your local system, using the following format:
      ```yaml
      apiVersion: v1
      clusters:
      - cluster:
          server: http://127.0.0.1:PROXY_PORT
        name: proxy
      contexts:
      - context:
          cluster: proxy
          user: proxy
        name: proxy
      current-context: proxy
      users:
      - name: proxy
      ```
    - Remember to replace **PROXY_PORT** with the same port you've used to open the proxy.
    - In the Monokle application, open the Settings panel and navigate to the KUBECONFIG setting under Project Settings.
    - Browse for the file you've created and select it to be used by Monokle. The Cluster Selector in the header should be updated with the new "proxy" context. 
    - Try connecting to the cluster again to see if the problem persists.


If the above solutions do not resolve your issue, please contact us on GitHub or Discord for further assistance.
