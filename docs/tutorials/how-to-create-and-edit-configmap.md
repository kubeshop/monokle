# How to Work with ConfigMaps

In this Monokle tutorial, we will illustrate how to create and edit ConfigMap resources to store non-confidential 
data in key-value pairs.       

Let’s get started! 

## **Launch Monokle**

<em>**Note:** Please follow this [Getting Started](../getting-started.md) guide to install Monokle 🚀</em>

Launch Monokle and, on the welcome screen, there are three options to start working with projects:

 - Select an exisiting folder.
 - Create an empty project.
 - Start from a template.
 
 Click **Select an existing project** to add your project folder containing K8 resources. 

![Image 1](img/image-1-1.6.0.png)

## **Select Folder**

Select your folder to parse its manifest in the file explorer. 

![Image 2](img/image-2-1.6.0.png)

In the file explorer, you can view manifests, including their resources and their relationships.

## **Select Manifests**

Scroll up and down to navigate and select the required manifests. 

![Image 3](img/imaged-3-1.6.0.gif)

Once you select a manifest, its related resources will be highlighted automatically in the navigator.

## **Create a New Resource**

Click on the **Add** button (plus sign) in the Navigator to launch the **Add New Resource** dialog for creating resources. 

![Add Resource](img/config-map-add-resource-1.5.0.png)

At the bottom of the dialog, you can select the option to:
- Save to folder.
- Add to file.
- Don't save.

![Resource save](img/add-resource-save-options-1.5.0.png)

## **Use the Source Editor** 

**Step 1:** Navigate and select the ConfigMap resources in the Navigator.  

Once you select a resource, its source code will be launched automatically in the Source Editor. 

![Image 4](img/image-4-1.6.0.png)

The Source Editor allows you to view and edit the source code easily. 

**Step 2:** Right click anywhere in the Source Editor to launch the menu to select the required editing option from the drop-down list.

![Image 6](img/image-6-1.6 .0.png)

You can also edit the source code using the Form Editor, which does not require any coding effort.

## **Using the ConfigMap Editor**

The ConfigMap Editor collects the required information and passes it to another entity. To launch the ConfigMap Editor, click on the **ConfigMap** button. 

![Image 7](img/image-7-1.5.0.png)

### **For Configuration Data**

**Step 1:** Click on the **Add Item** button to create a new text field for data configuration.

![Image 8](img/image-8-1.5.0.png)

**Step 2:** Enter the text configuration data in key-value pair fields.

<em>**Note:** You can also edit the existing data in the key-value pair fields.</em>

![Image 9](img/image-9.png)

### **For Binary Configuration Data** 

**Step 1:** Click on the **Add Item** button to create a new binary data field for binary data configuration.

![Image 10](img/image-10-1.5.0.png)

**Step 2:** Enter the binary configuration data in key-value pair fields.

<em>**Note:** You can also edit the existing binary configuration data in the fields.</em> 

![Image 11](img/image-11.png)

**Step 3:** Tick the **Immutable** checkbox to ensure the data stored in the ConfigMap is not updated. 

![Image 12](img/image-12.png)

## **Using the Object Metadata Editor**

To launch the Metadata Editor, click on the **Metadata** button.

![Metadata Button](img/metadata-button-image-1.6.0.png)

For editing object metadata, you need to provide a specific name, namespace, annotations, labels, cluster name, generate name, and finalizers to uniquely identify the object.  

### **Name**

**Step 1:** Enter the specific key name in the name field to give a unique identity to the object.

![Image 13](img/image-13-1.6.0.png)

<em>**Note:** The name of the ConfigMap must be unique within a namespace.</em>

### **Namespace**

**Step 1:** Enter namespace in the namespace field to organize clusters into virtual sub-clusters. 

![Image 14](img/image-14-1.6.0.png)

<em>**Note:** Provide a unique namespace within the ConfigMap. If left empty, the default namespace value shall be assigned automatically.</em> 

### **Annotations**

**Step 1:** Click on the **Add Item** button to create the new key-value field for annotations. 

![Image 15](img/image-15-1.6.0.png)

**Step 2:** Enter the arbitrary metadata in key-value pair fields.

<em>**Note:** You can also edit the existing arbitrary metadata data in the fields.</em> 

![Image 16](img/image-16.png)

### **Labels**

**Step 1:** Click on **Add Item** button to create the new key-value field for labels.

![Image 17](img/image-17.png)

**Step 2:** Enter the label's details in the key-value pair field.

<em>**Note:**  You also can edit existing label data in the fields.</em> 

![Image 18](img/image-18.png)

### **Cluster Name**

Enter the name of the cluster in the **Cluster Name** field to which the object belongs.

![Image 19](img/image-19-1.6.0.png)

### **Generate Name**

Enter a prefix in the **Generate Name** field.

<em>**Note:** You can also edit the existing data in the **Generate Name** field.</em> 

![Image 20](img/image-20-1.6.0.png)

### **Finalizers**

**Step 1:** Click on the **Add Item** button to create the new finalizer field.

![Image 21](img/image-21-1.6.0.png)

**Step 2:** Enter the finalizer in the finalizers field. 

<em>**Note:** You also can edit the existing data in the finalizer fields.</em> 

![Image 22](img/image-22-1.6.0.png)

Kubernetes is prompted to wait until specific conditions are met before it fully deletes resources marked for deletion.

<em>**Note:** Finalizer must be empty before the object is deleted from the registry.</em> 

The source editor provides autocomplete and autosave options to automatically save your edits. 
                 
## **Questions or Comments?**

Please feel free to join our open source community on Discord with this [Invite Link](https://discord.gg/6zupCZFQbe) and start your discussion. 
