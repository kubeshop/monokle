# Using the Form Editor

## **Edit Resources Properties via Form**

Monokle shows form editors for diverse Kubernetes resources which allows you to interactively change the specification of your resources using visual controls/inputs.

![Form Editor](img/form-editor-1.5.0.png)

For example in the case of a ConfigMap Kubernetes resource, clicking on "Form" at the top of the Editor, opens the form fields editor for key ConfigMap properties, allowing you to edit/discover all available properties without having to learn or lookup the corresponding YAML/resource documentation. Any changes made and saved (with the Save button on the top right)
are written back to the underlying YAML. 

## **Using the Object Metadata Editor**

To launch the Metadata Editor, click on the **Metadata** button.

![Metadata Button](img/metadata-button-image-1.5.0.png)

For editing object metadata, you need to provide a specific name, namespace, annotations, labels, cluster name, generate name, and finalizers to uniquely identify the object.  

**Check out [this tutorial](tutorials/how-to-create-and-edit-configmap.md) for more details 
on how to use the Form Editor and Metadata.**
