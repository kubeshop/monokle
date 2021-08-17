# Cluster Integration

Although Monokle is mainly geared at working with manifest files, it also has the possibility to connect 
to a cluster and show all contained resources, providing a convenient and easy way to inspect cluster resources.

Selecting the "Cluster Preview" button in the left toolbar replaces the File Explorer with a Clusters tab:

![Clusters Tab](img/clusters-tab.png)

- The kubeconfig field sets which kubeconfig to use for cluster interactions (this is the same as in the global settings)

Selecting the "Show Cluster Objects" button will attempt to populate the Resource Navigator with objects from the configured cluster:

![Cluster Preview](img/cluster-preview.png)

Monokle is now in "Cluster Mode" (as indicated by the header at the top):

- the File Explorer has been disabled if a folder had been previously selected
- the Navigator contains all resources retrieved from the configured cluster:
  - resource navigation works as with files; selecting a resource shows its content in the source editor in read-only mode
  - resource links are shown as before with corresponding popups/links/etc.
- selecting "Exit" in the top right restores the contents of the Resource Navigator to the currently selected folder (if any)

(You can also exit Cluster Mode by selecting the File Explorer in the left toolbar and selecting a new folder with the "Browse" button) 


