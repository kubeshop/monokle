# Resource Compare

The Resource Compare functionality allows you to compare a set of local resources (vanilla or generated with 
Helm/Kustomize) to the resources in your clusters:

- Easily see which of your local resources are different in the cluster.
- Deploy your local resources to the cluster.
- Replace your local resources with the ones from the cluster.
- Compare the resources from Helm chart and Kustomize previews to the cluster resources.

To use Resource Compare follow these steps:

- Browse to a folder containing manifests/kustomizations/Helm charts.
- Preview the desired kustomization or helm values file.
- Select the desired cluster context in the Cluster tab to the left.
- Press the **Compare Resources** button at the top of the Resource Navigator:

![Resource Compare](img/resource-compare-button-1.9.png)

The Comparing resources modal opens and allows the selection of resources to compare from the drop downs on the left and right. 

Tick the **Select all** check box to deploy all local resources to the cluster or select individual resources via the check box to the left of the resource.

![Resource Compare Selector](img/resource-compare-selection-1.9.png)

After selecting the resources to compare, select any relevant resource(s) to **Deploy to cluster** or **Extract to local**.

![Resource Compare Options](img/resource-compare-options-1.9.png)

<!-- Check out our video to see it in action:

[![Monokle Cluster Compare](img/cluster-compare.png)](https://youtu.be/9ha3-aPgSt8) -->
