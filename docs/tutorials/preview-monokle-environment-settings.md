# Preview Monokle Environment Settings

Monokle is a fully integrated IDE for managing manifests. It provides instant access for debugging Kubernetes resources without looking into the yaml syntax. 

In this tutorial, we have illustrated the steps to set up Monokle Environment. 

Let’s get started. 

**Step 1:** Launch Monokle and click on the Settings button to set up the Kubernetes dashboard.

<em>**Note:** Please follow this Getting Started guide to install Monokle 🚀</em>

![Settings](img/settings-1.png)

**Step 2:** Enter the kubeconfig file path in the KUBECONFIG text field. 

![Kubeconfig](img/kubeconfig-2.png)

Alternatively, you can click on the Browse button to fetch the kubeconfig file for configuring cluster access. 

![Browse](img/browse-3.png)

Select the required folder to config the cluster. 

![Folders](img/folders-4.png)

<em>**Note:** The kubectl command-line tool uses kubeconfig files to find the information for choosing a cluster and communicating with the API server.</em>

**Step 3:** Click on the Add Pattern button to include the files having the corresponding extension. For example .yaml. 

![Add pattern](img/add-pattern-5.png)

Enter the extension pattern in the files include textbox and hit the OK button. 

![Ok](img/ok-6.png)

**Step 4:** Click on the Add Pattern button to exclude the files having the corresponding extension. For example, node_modules.

![Add pattern](img/add-pattern-7.png)

Enter the extension pattern in the files exclude textbox and hit the OK button. 

![Ok](img/ok-8.png)

**Step 5:** Click on Helm Preview Mode dropdown to select any of the viewing states. 

The options for preview:

**Template** - To use Helm template
 
**Install -** To use Helm Install

![Helm](img/helm-9.png)

**Step 6:** Tick the Automatically Load Last Folder checkbox to reload the last reviewed folder on launching Monokle. 

![Startup](img/startup-10.png)

Thus you can set up your Monokle environment. 

If you still have doubts, feel free to connect with us. Monokle is your K8s best friend!
