# Features

Here is a short list of some of the features currently in Monokle.

A big thanks to the excellent [Argo-Rollouts](https://github.com/argoproj/argo-rollouts/) project on GitHub for
providing plentiful manifests for us to run Monokle against.

## Navigate k8s objects easily

<img src="./img/navigator.gif" alt="Navigate k8s objects easily" width="300" height="300" />

Monokle compiles a list of all the objects in your repo (from files you didnt want ignored), to give you a handy
overview of all your resources.

## Follow links up- or downstream through your manifests

<img src="./img/upstream-downstream.gif" alt="Follow links up or downstream through your manifests" width="600" height="300" />

Surf up- or downstream through your resources! Monokle highlights other resources, that your selection has direct
relations to and even provides you with the links to go to them quickly.

## Preview the resources created by kustomizations

<img src="./img/kustomization.gif" alt="Preview the resources created by kustomizations" width="800" height="500" />

Do a quick dry-run, enabling you to navigate the resources, that will be created by your Kustomizations. Apply them to
the cluster, if you are satisfied.

## Locate source file quickly, and see if links are dead-ends

<img src="./img/find-file-and-dead-links.gif" alt="Locate source file quickly, and see if links are dead-ends" width="800" height="500" />

When you select a resource, Monokle will show you which file it was defined in. Also, if you mistype a referenced
resource, Monokle will quickly show you, that you have a dead link with a warning triangle.

## Browse your clusters objects

<img src="./img/cluster-objects.gif" alt="Browse your clusters objects" width="800" height="500" />

Want to browse your cluster instead of a repo? Simply smash the "Show Cluster Objects" button to import all objects from
the cluster into Monokle.
