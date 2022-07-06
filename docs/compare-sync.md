# Compare & Sync

The Compare & Sync functionality allows you to compare and synchronize two sets of resources.

Each set of resources can be one of the following:
- Resources from your local manifest files.
- Resources from a cluster.
- Resources from the [Preview](helm.md) of a Helm Chart.
- Resources from the [Preview](kustomize.md) of a Kustomization.

Here are some of the scenarios where Compare & Sync can help you:
1. Compare local resources to the resources in your cluster AND:
  - Deploy local resources to the cluster.
  - Extract cluster resources to local.
2. Compare resources between two clusters AND:
  - Deploy resources from one cluster to another.
3. Compare resources between a Helm Chart or Kustomization preview to a cluster AND:
  - Deploy the output of the Helm chart to the cluster.
4. Compare resources between a Helm Chart or Kustomization preview to your local resources AND:
  - Extract resources from the preview to your local files.
5. Compare the output of a Helm Chart using two different values files.
6. Compare the output of two different Helm Charts.
7. Compare the output of a Helm Chart to the output of a Kustomization.
8. Compare two Kustomization outputs.

To use Compare & Sync follow these steps:

- Browse to a folder containing manifests/Kustomizations/Helm charts.
- Press the **Compare & Sync** button at the top of the Resource Navigator:

![Compare & Sync](img/cluster-compare-button-1.6.0.png)

The Compare & Sync modal opens and shows the local resources on the left and the cluster resources on the right. 

TODO: Add overview image

TODO: How to configure each section with images

TODO: Search bard

TODO: Filtering resources

TODO: Specifying "default" namespace for resources that don't have it specified
