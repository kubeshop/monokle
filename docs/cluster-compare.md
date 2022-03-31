# Cluster Compare

The Cluster Compare functionality allows you to compare a set of local resources (vanilla or generated with 
Helm/Kustomize) to the resources in your clusters:

- Easily see which of your local resources are different in the cluster.
- Deploy your local resources to the cluster.
- Replace your local resources with the ones from the cluster.
- Compare the resources from Helm chart and Kustomize previews to the cluster resources.

To use Cluster Compare follow these steps:

- Browse to a folder containing manifests / kustomizations / Helm charts.
- Preview the desired kustomization or helm values file.
- Select the desired cluster context in the Cluster tab to the left.
- Press the **Cluster Compare** button at the top of the Resource Navigator:

![Cluster Compare](img/cluster-compare-button-1.6.0.png)

The Cluster Compare modal opens and shows the local resources on the left and the cluster resources on the right. 

Tick the **Select all** check box to deploy all local resources to the cluster or select individual resources via the check box to the left of the resource.

![Cluster Compare Selector](img/cluster-compare-selection-1.6.0.png)

Click the **Deploy selected local resources (#) to cluster** button to complete the deployment.

Check out the below short video to see it in action:

[![Monokle Cluster Compare](img/cluster-compare.png)](https://youtu.be/9ha3-aPgSt8)
