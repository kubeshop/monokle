# Cluster Integration

Although Monokle is mainly geared toward working with manifest files, it also has the capability to connect 
to a cluster and show all contained resources, providing a convenient and easy way to inspect cluster resources.

Monokle will automatically detect the default Kubeconfig file or it can be declared in Settings:

![Kubeconfig Setting](img/kubeconfig-setting-1.6.0.png)

## **Using the Cluster Selector**

Choose a cluster to work with by using the Cluster Selector:

![Clusters Tab](img/clusters-tab-1.6.0.png)

If the Cluster Selector does not appear, ensure that the **Show Cluster Selector** option is checked in the Settings menu:

![Cluster Preview](img/cluster-selector-1.6.0.png)

Selecting the **Load** button will attempt to populate the Resource Navigator with objects from the configured cluster:

![Cluster Preview](img/cluster-preview-1.6.0.png)

Monokle is now in **Cluster Mode** (as indicated by the header at the top):

![Cluster Preview](img/cluster-preview2-1.6.0.png)

- The File Explorer has been disabled if a folder had been previously selected.
- The Navigator contains all resources retrieved from the configured cluster:
  - Resource navigation works as with files; selecting a resource shows its content in the source editor.
  - Resource links are shown as before with corresponding popups/links/etc.
- Selecting **Exit** in the top right restores the contents of the Resource Navigator to the currently selected folder.

## **Working with Multiple Resources**

In the Navigator, hover over a local resource to display a check box to select one or more resources:

![Cluster Resource Check Box](img/navigator-resource-check-box-1.6.0.png)

Selecting one or more resources brings up the **Action Links** at the top of the Navigator where the **Delete** and **Deploy** options are available:

![Cluster Resource Check Box Select](img/navigator-select-cluster-resources-1.6.0.png)

This same functionality is available for cluster resources where the **Delete** and **Save to file/folder** are the options:

![Cluster Resource Check Box Options](img/navigator-resource-cluster-actions-1.5.0.png)



