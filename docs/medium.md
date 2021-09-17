# Monokle 1.1.0
Your best k8s friend Monokle is friendlier than ever! After our initial release, we’ve focused on fixing bugs and improving core functionality. Here comes a quick run-down!

## Prerequisites:
### The prerequisite for the Monokle include:

medium/Image table-1.png

## File Explorer

In File Explorer, you can browse and load the folder containing resource manifests. You can configure the kubeconfig variable to load and view the available clusters. Monokle automatically synchronizes the changes in the selected folder.  

medium/Image file-explorer-2.png


## New Resource Wizard

You can now create new k8s resources directly in the Monokle UI; start by browsing to your project folder, and once opened, select the “New Resource” button on top of the Navigator, which opens a corresponding dialog that looks like this:

medium/Image new-resource-wizard-3.1.png

source will be added to the Navigator and opened for editing, use the Save button at the top right to save the resource to a new file or append it to an existing one (for multi-resource manifest files).

medium/Image new-resource-wizard-3.2.png

Once a resource has been saved initially the auto-save functionality will be triggered, as mentioned below.

## Automatic Resource Validation

Monokle now automatically validates all resources against the corresponding Kubernetes 1.22.1 schemas. Resources that fail validation will show an error icon in the Navigator which can be clicked to view error details.

medium/Image automatic-esource-validation-4.1.png

## Resource Filtering

The initial release of Monokle allowed you to filter resources on namespace only. However, with the 1.1.0 version, you can now filter your resources based on multiple factors:

1. Name (with a wildcard)
2. Kind
3. Namespace
4. Labels (existence or with specific value)
5. Annotations (existence or with particular value)

The filter button at the top of the Resource Navigator shall launch the below dialog for the settings as shown below:


medium/Image resource-filtering-5.1.png

## Edit and Apply Resources in Cluster View

Now you can view and edit resources from a cluster. It allows you to quickly execute changes and apply them back to your cluster which is helpful for making a quick fix to a resource.

medium/Image edit-and-apply-resources-in-cluster-view-6.1.png

## Diff


After you apply resources to the currently configured cluster, the differences in code base are highlighted automatically. The diff dialog reflects source code with and without the retrieved resource from the cluster. 

medium/Image diff-7.1.png

## Reload the Last Folder on the Startup

The Settings now include an option to automatically reload the last viewed folder on startup.

medium/Image reload-the-last-folder-on-the-startup-8.1.png

## Navigation History

Navigating back and forth between selected resources is now done using navigation buttons and corresponding Alt-Left/Right keyboard shortcuts.

medium/Image navigation-history-9.1.png

## Automatic Save / Validation of Resources

Monokle automatically saves any changes you make to your resources (similar to most IDEs) and updates corresponding validations and links.

## Editing of Kustomizations / Helm Values Files During Preview

When previewing Kustomizations or Helm Charts, it is now possible to edit the previewed files and recreate the preview — instead of having to exit the preview before making the change. This makes debugging of Kustomizations and Helm Charts a much smoother experience.

medium/Image kustomizations-helm-10.1.png

## Run Monokle from the Command-line (Mac only for now)

Monokle now automatically installs a monokle script on macOS, allowing you to launch Monokle directly from your favorite terminal, optionally specifying a folder for Monokle to open.

## Hiding of Empty Sections in the Navigator

In the navigation panel, Monokle automatically hides the sections when there are no resources in it. For example, if the resource collection inside the configuration section is empty, then the section will not render on your interface. It allows users to navigate the required resources for all possible actions and maintains control of the user. 

## Scroll Into View and Auto-Expand when Selecting Links and Resource

You can now scroll upstream or downstream in the view to navigate your file. When you select a file in explorer, the associated resources will automatically get scrolled up and highlighted in the Navigator. The base code of the file will be shown in the source editor - enabling you to edit the file directly. 

 medium/Image scroll-into-view-and-auto-expand-when-selecting-links-and-resource-11.1.png

## Check For Command-line Tools on Startup


Monokle checks for command-line dependency tools; if the tools are not installed, the user is triggered with an installation error message. So first, you need to install and configure the dependencies in your system to launch Monokle.

 medium/Image check-for-command-line-tools-on-startup-12.1.png

## Resource Links

In the navigator, the links indicate the interconnection among resources. Links on the left side of the resource indicate the incoming link to the resource. For example, a ConfigMap can have an incoming link from Deployment. The links on the right side show the outgoing links from the resource. For example, the Service can have an outgoing link from Deployment. 

The warning triangle indicates the respective resource links that are not referring to any objects. 

medium/Image resource-links-13.1.png

## Browse Clusters


Monokle allows you to connect clusters and view all the contained resources in the Navigator. It provides a convenient and easy way to check out the cluster resources. For all cluster interactions, you have to configure kubeconfig. 

medium/Image browse-clusters-14.1.png

## Source Editor

In the editor, you can view and edit the source code of the YAML file or resource. The editor provides access to predefined commands using a command palette. It allows you to search symbols, format documents, and change occurrences. 

Since Monokle is aware of all native Kubernetes resources, it helps to autocomplete the context while providing resource links. 

medium/Image source-editor-15.1.png

## Form Editor

There is a form editor to edit the key properties of ConfigMap resources. It allows you to discover and edit the properties without inspecting the corresponding YAML documentation. It automatically saves the changes and converts the data to YAML. 

medium/Image form-editor-16.1.png

The significant Windows version is coming up in the next release!

### Minor Changes and Improvements

There are also some minor improvements including:

1. Reload Cluster and Kustomize / Helm Preview actions
2. Show Resource Kind for broken links
3. Splash-screen + updated logo
4. Bug fixes!

### What’s Next?

The list of features we’d like to add and fix in 1.2.0 are comprehensive. However, you can have a bird’s-eye view of the major improvements we have planned to introduce:

1. A plugin framework for adding/managing plugins that can add custom Resource Kinds to the Monokle UI (with other types of plugins coming soon after)
2. A Cluster Diff mode allowing you to easily compare your local resources (files or kustomize/helm previews) to those in your cluster
3. Improved support for Helm Charts and Templates
4. Auto-update functionality with signed installers
5. Better integration with the host OS via corresponding Electron features
6. Resource refactoring functionality
7. Rendering/Performance improvements

Check out the entire list on GitHub(https://github.com/kubeshop/monokle/milestone/2) — and let us know if you’re missing something we should be adding to make your everyday life with k8s manifests and resources easier.

Download the release on GitHub(https://github.com/kubeshop/monokle/releases/tag/v1.1.0)
Check out the documentation(https://kubeshop.github.io/monokle/)

Monokle is brought to you by kubeshop.io
Happy days!

/Monokle-team















