# FAQ

## **1. What are the prerequisites for using Monokle?**

You will need to install the following two prerequisites to successfully run Monokle:

1. [Helm](https://helm.sh/docs/intro/install/) - Required for [Helm Preview](./helm.md#helm-preview) functionality.
2. [Kubectl](https://kubernetes.io/docs/tasks/tools/) - Required for [Kustomize Preview](./kustomize.md#kustomize-preview) and [Deploy/Diff](./apply-and-diff.md) functionality.

## **2. What OS does Monokle support?**

Monokle supports Windows, MacOS and Linux. Get the latest installers for MacOS and Windows on [GitHub](https://github.com/kubeshop/monokle). For running Monokle on
Linux, run it from the source, following the steps as outlined in the [Getting Started](./getting-started.md)
documentation.

## **3. Why can’t I add any clusters?**

While adding new clusters, a valid kubeconfig file is required. Please check that all the needed configuration settings
are present in your kubeconfig file are valid. For more detail
read the [kubeconfig](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/) documentation.

## **4. Why is Kubectl required to run Monokle?**

You need to install and configure kubectl for previewing [kustomization.yaml](./kustomize.md) files. It helps to debug
your configurations before you deploy them to your cluster.

## **5. Does Monokle support Helm?**

Yes, Monokle allows you to navigate and preview the output of a Helm chart for an existing values files. Read more at
[Working with Helm](./helm.md).

## **6. Can I work on multiple projects simultaneously?**

You can launch multiple project windows using the [New Monokle Windows](../overview/#multiple-windows) option. It allows
you to work on multiple folders or clusters simultaneously; thus visual navigation for the multiple pages becomes simpler
and faster.

## **7. Can I use Monokle with Flux/ArgoCD?**

Yes, Monokle can be used for creating / editing / debugging manifests before they are deployed to a cluster using a CD tool
like ArgoCD or Flux.

## **8. How to open Helm and Kustomization preview?**

You can navigate to the resources created by Kustomize or Helm in the navigator. Hover over the resources and hit the
 button to perform the preview and see the generated resources in the navigator.

## **9. Why is Autocomplete not working in the editor?**

The source editor provides an autocomplete option for only native Kubernetes resources. Therefore, the autocomplete feature is not available for any other resources except the resources in the YAML manifests.

## **10. How to save changes in the editor?**

The source editor automatically saves the current changes in your resource manifests as long as they are valid YAML files.
