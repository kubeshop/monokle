# Cluster Compare

The Cluster Compare functionality allows you to compare a set of local resources (vanilla or generated with 
Helm/Kustomize) to the resources in your clusters, allowing you to 

- easily see which of your local resources are different in the cluster
- deploy your local resources to the cluster
- replace your local resources with the ones from the cluster
- compare the resources from Helm chart and Kustomize previews to the cluster resources

To use Cluster Compare follow these steps:

- Browse to a folder containing manifests / kustomizations / Helm charts
- Preview the desired kustomization or helm values file
- Select the desired cluster context in the Cluster tab to the left
- Press the "Cluster Compare" button at the top of the Resource Navigator:

![Cluster Compare](img/cluster-compare-button.png)

Check out the below short video to see how it in action:

[![Monokle Cluster Compare](img/cluster-compare.png)](https://youtu.be/9ha3-aPgSt8)
