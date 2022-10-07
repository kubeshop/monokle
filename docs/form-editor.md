# Using the Form Editor

## **Edit Resources Properties via Form**

Monokle shows form editors for diverse Kubernetes resources which allows you to interactively change the specification of your resources using visual controls/inputs.

![Form Editor](img/form-editor-1.11.png)

For example in the case of a ConfigMap Kubernetes resource, clicking on the **Form** tab at the top of the Editor, opens the form fields editor for key ConfigMap properties, allowing you to edit/discover all available properties without having to learn or lookup the corresponding YAML/resource documentation. Any changes made and saved (with the Save button on the top right)
are written back to the underlying YAML. 

### **Modified Values Highlighted in Code Editor**

To have insight into the changes made to your configuration, the exact properties edited with Monokle’s Form Editor are highlighted when you make the transition from the Form Editor tab to the Source tab. This highlighting feature identifies all changes providing full visibility of edited resources as you work toward attaining your desired state.

![Form Editor Highlights](img/form-editor-highlights-1.11.png)

### **Side-by-Side Editors**

The configuration file you are editing can be visible even when you are using templates.

Click on the side-by-side icon at the top right of the editor to open a side-by-side view showing the source code on the left and the form editor on the right, providing instant visibility of the changed files while updating the state. 

![Side by Side Editor Icon](img/side-by-side-editor-icon-1.11.png)

![Side by Side Editor](img/side-by-side-editor-1.11.png)



## **Using the Object Metadata Editor**

To launch the Metadata Editor, click on the **Metadata** tab.

![Metadata Button](img/metadata-button-image-1.9.png)

For editing object metadata, you need to provide a specific name, namespace, annotations, labels, cluster name, generate name, and finalizers to uniquely identify the object.  

**Check out [this tutorial](tutorials/how-to-create-and-edit-configmap.md) for more details 
on how to use the Form Editor and Metadata.**
