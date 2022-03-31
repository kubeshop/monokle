# How to Browse Clusters

In this Monokle tutorial, we will illustrate the steps to connect to a cluster and navigate/update contained resources.

Let’s get started! 

## **1. Configure a Cluster**
 
Launch Monokle and ensure that the setting **Show Cluster Selector** box is checked.

![Cluster selector](img/cluster-selector-1.6.0.png)


If this is the first time to configure a cluster in Monokle, you will see **No Cluster Configured** and the **Configure** button at the top of the screen:

![No cluster configured](img/no-cluster-configured.png)

Clicking the **Configure** button opens the widget to specify the cluster to load by inserting its location:

![Configure Cluster Widget](img/configure-cluster.png)

After clusters are configured, select the cluster you wish to work with from the drop down list at the top of the screen and click **Load**.

![Cluster mode](img/cluster-mode-1-1.6.0.png)

Monokle will switch to the **Cluster Mode**, and the Navigator will reflect all the resources retrieved from the configured cluster. 

## **2. Navigate/Select Resources**

Select a resource to view its source code in the Editor. Editing resources in cluster mode allows quick changes to be made and deployed back to the cluster.

 ![Editor](img/editor-5-1.6.0.png)

## **3. Diff Changes Against Cluster**

Click the **Diff** button to analyze and compare the selected resource against the currently configured cluster.

![Diff](img/diff-7-1.5.0.png)

The comparison table will look like this:

![Diff table](img/diff-tble-8-1.5.0.png)

## **4. Deploy Changes**

Click on the **Deploy** button to update the resource to the currently configured cluster.

![Deploy](img/deploy-1.5.0.png)

Then select the namespace for deployment. Select an existing namespace from the cluster, create a new namespace, or don't specify a namespace at all.

By selecting **None**, **Deploy** will use the namespaces declared in the resources. 

![Deploy 1](img/deploy-1-1.5.0.png)

The resource deployed dialog will be shown in the top-right corner of the console.

![Deploy 2](img/deploy-2-1.5.0.png)

## **5. Exit Cluster Mode**

Click on the **Exit** button on the top-right corner of the console to restore the resources of the currently selected folder. 

 ![Exit](img/exit-9-1.5.0.png)
 
## **Questions or Comments?**

Please feel free to join our open source community on Discord with this [Invite Link](https://discord.gg/6zupCZFQbe) and start your discussion.
