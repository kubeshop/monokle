# How to Browse Clusters


Monokle is a fully integrated IDE for managing manifests. It provides instant access for debugging Kubernetes resources without looking into the YAML syntax. 

In this tutorial, we have illustrated the steps to help you browse and debug the resources generated with kustomize and Helm. 

Let’s get started. 

**Step 1:** Launch Monokle and click on the Browse button to add your project folder containing K8 resources. 

<em>**Note:** Please follow this [Getting Started](https://github.com/kubeshop/monokle#readme) guide to install Monokle 🚀</em>

![Image](img/image-0.png)
 
**Step 2:** Select your folder to parse its manifest in Monokle’s File Explorer. 

 ![Image](img/image-0.1.png)

In the file explorer, you can view manifests, including their resources, and their relationships.

**Step 3:** Scroll up & down to navigate and select the required manifests. 

![Image](img/image-0.2.gif)

Once you select a manifest, its related resources shall be highlighted automatically in the navigator. 

**Step 4:** Click on the Cluster Preview button in the file explorer.

![Cluster mode](img/cluster-mode-1.png)

**Step 5:** Click on the Browse button to fetch the kubeconfig file for configuring cluster access. 

 ![Browse](img/browse-2.png)

Alternatively, you can also enter the kubeconfig file path manually in the KUBECONFIG text field. 

 ![Kubeconfig](img/kubeconfig-3.png)

<em>**Note:** The kubectl command-line tool uses kubeconfig files to find the information it needs to choose a cluster and communicate with the API server.</em>

**Step 6:** Click on the Show Cluster Objects button to launch the resources in the configured cluster. 

![Show Cluster](img/show-cluster-4.png) 

Monokle will switch to the Cluster-Mode, and the Navigator will reflect all the resources retrieved from the configured cluster. 

**Step 7:** Select a resource to view its source code in the source editor (in read-only mode). 

 ![Editor](img/editor-5.png)

**Step 8:** Click on the Apply button to assign the resource to the currently configured cluster.

![Apply](img/apply-6.png)

Resource applied will be shown in the top-right corner of the console. 

**Step 9:** Click the Diff button to analyze and compare the selected resource against the currently configured cluster. 

 ![Diff](img/diff-7.png)

The comparison table will look like this:

 ![Diff table](img/diff-tble-8.png)

**Step 10:** Click on the Exit button on the top-right corner of the console to restore the resources of the currently selected folder. 

 ![Exit](img/exit-9.png)

Thus you can browse cluster resources. 

Got queries? Please feel free to join our open source community on Discord with this [invite link](https://discord.gg/6zupCZFQbe) and start your discussion.
