# Cluster Integration

Although Monokle is mainly geared at working with manifest files, it also has the capability to connect 
to a cluster and show all contained resources, providing a convenient and easy way to inspect cluster resources.

Choose a cluster to work with by using the Cluster Selector:

![Clusters Tab](img/clusters-tab-1.5.0.png)

If the Cluster Selector does not appear, ensure that the **Show Cluster Selector** option is checked in the Settings menu:

![Cluster Preview](img/cluster-selector-1.5.0.png)

Selecting the **Load** button will attempt to populate the Resource Navigator with objects from the configured cluster:

![Cluster Preview](img/cluster-preview-1.5.0.png)

Monokle is now in **Cluster Mode** (as indicated by the header at the top):

![Cluster Preview](img/cluster-preview2-1.5.0.png)

- The File Explorer has been disabled if a folder had been previously selected.
- The Navigator contains all resources retrieved from the configured cluster:
  - Resource navigation works as with files; selecting a resource shows its content in the source editor.
  - Resource links are shown as before with corresponding popups/links/etc.
- Selecting **Exit** in the top right restores the contents of the Resource Navigator to the currently selected folder.
