# How to Browse Clusters

In this Monokle tutorial, we will illustrate the steps to connect to a cluster and navigate/update contained resources.

Let’s get started. 

## 1. Select Cluster Preview
 
Launch Monokle and click on the Cluster Preview button in the file explorer.

![Cluster mode](img/cluster-mode-1.png)

## 2. Specify kubeconfig

Click on the Browse button to fetch the kubeconfig file for configuring cluster access. 

 ![Browse](img/browse-2.png)

Alternatively, you can also enter the kubeconfig file path manually in the KUBECONFIG text field. 

 ![Kubeconfig](img/kubeconfig-3.png)

<em>**Note:** The kubectl command-line tool uses kubeconfig files to find the information it needs to choose a cluster and communicate with the API server.</em>

## 3. Retrieve Cluster objects

Click on the Show Cluster Objects button to launch the resources in the configured cluster. 

![Show Cluster](img/show-cluster-4.png) 

Monokle will switch to the Cluster-Mode, and the Navigator will reflect all the resources retrieved from the configured cluster. 

## 4. Navigate / Select resources

Select a resource to view its source code in the source editor. You can edit resources in cluster-mode, allowing you to make quick changes and apply them back to your cluster

 ![Editor](img/editor-5.png)

## 5. Diff changes against Cluster

Click the Diff button to analyze and compare the selected resource against the currently configured cluster.

![Diff](img/diff-7.png)

The comparison table will look like this:

![Diff table](img/diff-tble-8.png)

## 6. Apply changes

Click on the Apply button to update the resource to the currently configured cluster.

![Apply](img/apply-6.png)

Resource applied will be shown in the top-right corner of the console.

## 7. Exit Cluster mode

Click on the Exit button on the top-right corner of the console to restore the resources of the currently selected folder. 

 ![Exit](img/exit-9.png)

Thus you can browse cluster resources. 

Got queries? Please feel free to join our open source community on Discord with this [invite link](https://discord.gg/6zupCZFQbe) and start your discussion.
