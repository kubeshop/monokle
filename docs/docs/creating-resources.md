# Creating Resources

## **Add a Resource**

While using Monokle Desktop, you can directly add new K8s resources. Once you have browsed and added your project folder, click on the **Create Resource** button at the top of the navigator to open the **Create Resource** drop down.

![Add Resource Drop Down](img/add-resource-drop-down-2.0.png)

Select "New from scratch" or New from template".

## **New from Scratch**

![Add Resource](img/add-resource-from-scratch-2.0.png)

While creating a resource, it is possible to select an existing resource as a template from the drop-down menu. The options for this template are **Save to folder**, **Add to file** and **Don't save**.  

![Resource template](img/template-2.0.png)

If the last drop down is left as **Don't save**, that resource will be added to the Navigator resources but it will be highlighted in yellow:

![Unsaved resource](img/unsaved-resource-2.0.png)

These “unsaved” resources will have to be saved by the user to be able to reuse them. Clicking on a yellow resource will show the Save button in the Editor panel to save the highlighted resource.

![Save resource](img/save-resource-2.0.png)

## **New from Template**

Monokle Desktop allows the use of templates to start a new project via the **Start from a template** option:

![Start with Template](img/start-with-template-2.0.png)

The **Create a Project from a Template** dialog appears:

![Start with Template](img/name-project-2.0.png)

Name your project, select its location and click **Next: Select a Template**.

Monokle Desktop includes a default set of templates which are installed automatically when starting Monokle Desktop for the first time and available in the Templates Explorer when working with your Monokle Desktop projects:

![Default Templates](img/template-selection-2.0.png)

Check out the [Monokle Desktop Default Templates Plugin](https://github.com/kubeshop/monokle-default-templates-plugin) repository to 
see the complete list of templates that are included along with their corresponding schemas and manifests.

## **Navigator Resource Options**

Click the ellipsis to the right of a resource name to see the options available:

![Resource Options](img/navigator-resource-options-2.0.png)

### **Deploy a Resource**

You can deploy a resource to a namespace, selecting an existing namespace, creating a new namespace or not choosing a namespace.

![Deploy Resource](img/deploy-2.0.png)

<!--### **Diff a Resource**


![Diff Resource](img/diff.2.0.png)-->

### **Rename a Resource**

You can rename resources and update all the references associated with that resource to ensure the integrity of that link.

![Rename Resource](img/rename-2.0.png)

### **Clone a Resource**

You can use the Clone action to create a new resource by using existing resources as a template. 

![Clone Resource](img/clone-2.0.png)

### **Delete a Resource**

You can use the Delete action in the cluster mode to delete the resource from the actual cluster. 

![Delete Resource](img/delete-2.0.png)