# Resource Editing

## Source Editor

Selecting either a file or resource will show its contents in the source editor to the right. The editor will syntax-highlight for
yaml only at this point.

Right-clicking in the editor shows a list of available commands - and pressing F1 opens its command-palette:

![Source Editor Command Palette](img/source-editor-command-palette.png)

### Editing Resources

When editing resources (not files) the editor is schema-aware for all native Kubernetes resources, which provides
auto-complete (Ctrl-Space) and context-sensitive hover documentation

![Source Editor Auto Complete](img/source-editor-auto-complete.png)

![Source Editor Context Hover](img/source-editor-context-hover.png)

#### Resource Links

Resource links are marked in the gutter and underlined in the editor, with corresponding hover/popup windows to show linked resources:

![Source Editor Resource Links](img/source-editor-resource-links.png)

Broken links are shown with yellow triangles as in the Navigator:

![Source Editor Broken Links](img/source-editor-broken-links.png)

## Add Resource

While using Monokle, you can directly add new K8s resources. Once you have browsed and added your project folder, click on the “New Resource” button at the top of the navigator to launch the “Add New Resource” dialog.

![Add Resource](img/add-resource.png)

For adding resources to new or existing files in the navigator, click on the Save button at the top-right corner of the interface.

![Resource save](img/add-resource-save.png)

## Edit Resources in Cluster

You can easily view and edit resources from clusters. After making changes in a resource, you can quickly apply them back to the cluster.

![Resource cluster](img/resource-cluster.png)
#### Saving changes

The [Save] button on top of the editor will be enabled if valid changes have been made - invalid yaml will not be savable.
Saving a resource will update the containing file correspondingly and recalculate all affected ingoing/outging links for
the resource.

### Editing Files

When editing files directly by selecting them in the File Explorer the editor will at this point not show any links or provide 
context-sensitive editing functionality.

## Form Editor

To start with Monokle only shows a Form Editor for ConfigMap resources:

![Form Editor](img/form-editor.png)

The editor provides form fields for key ConfigMap properties, allowing you to edit/discover all available properties without 
having to learn or lookup the corresponding yaml/resource documentation. Any changes made and saved (with the Save button on the top right)
are written back to the underlying yaml.

## Rename Resource

You can rename resources and update all the references associated with that resource to ensure the integrity of that link.

![Rename Resource](img/rename.png)

## Clone Resource

You can use clone action to create a new resource by using existing resources as a template. 

![Clone Resource](img/clone.png)

## Delete Resource

You can use the delete action in the cluster mode to delete the resource from the actual cluster. 

![Delete Resource](img/delete.png)

## Resource Template

While creating a resource, it is possible to select an existing resource as a template from the drop-down menu. 

![Resource template](img/template.png)
