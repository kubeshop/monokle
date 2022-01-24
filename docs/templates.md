## What is a Monokle Template?

A Monokle Template is a mechanism for creating visual forms and interpolating the data from those forms into one or multiple manifests.

For each form, we must define the JSON schema of the data that we want to get as an input.

Additionally, we can provide a JSON schema for customizing the UI of the forms. An example of this would be specifying which widgets should be used.

Any folder that contains a `monokle-template.json` file can be a template.

### What’s the structure of `monokle-template.json` for a valid Monokle Template?

Here’s an example of a template that creates a Pod:
https://github.com/kubeshop/monokle-default-templates-plugin/blob/main/basic-pod-template/monokle-template.json

```json
{
  "name": "Basic Kubernetes Pod",
  "id": "io.kubeshop.monokle.templates.default.basic-pod-template",
  "author": "kubeshop.io",
  "version": "1.0.0",
  "description": "Creates a Pod for a specified Image",
  "repository": "",
  "type": "vanilla",
  "forms": [
    {
      "name": "Pod Settings",
      "description": "Specify the Image to use",
      "schema": "form-schema.json",
      "uiSchema": "form-ui-schema.json"
    }
  ],
  "manifests": [
    {
      "filePath": "template.yaml"
    }
  ],
  "resultMessage": "Pod resource created successfully!",
  "helpUrl": "https://github.com/kubeshop/monokle-default-templates-plugin"
}
```

The `name`, `id`, `author`, `version`, `description`, `type` and `forms` properties are required and all types of templates will have these properties.

In the above example, the type of the template is `"vanilla"`.

### What does a form schema look like?

The format of form schemas is JSON schema.
This defines how the data of the form will be sent to the template manifests.

```json
{
  "type": "object",
  "required": ["name", "image"],
  "properties": {
    "name": {
      "type": "string",
      "default": "my-pod"
    },
    "namespace": {
      "type": "string"
    },
    "image": {
      "type": "string"
    }
  }
}
```

For the above example, if this form is the first one in the `forms` array from `monokle-template.json`, then we will be able to use the values in the template manifests like this:

```yaml
propertyOne: [[forms[0].name]]
propertyTwo: [[forms[0].namespace]]
otherProperty: [[forms[0].image]]
```

### What does a form UI schema look like?

Example:

```json
{
  "name": {
    "ui:title": "Name",
    "ui:help": "The name of the Pod"
  },
  "namespace": {
    "ui:title": "Namespace",
    "ui:help": "The target namespace for the Pod",
    "ui:widget": "namespaceSelection"
  },
  "image": {
    "ui:title": "Image",
    "ui:help": "The image name to use for the Pod, for example nginx-ingress:latest"
  }
}
```

The role of this form is to specify information about how you want to render the form.

Read more about this here: https://react-jsonschema-form.readthedocs.io/en/latest/api-reference/uiSchema/

Monokle 1.5.0 provides the following widgets:

- namespaceSelection
- [TODO: list all widgets here]

### What types of templates exist?

Monokle 1.5.0 introduces vanilla templates and referenced helm chart templates.

#### Vanilla templates

The `type` property from `monokle-template.json` is "vanilla".

In vanilla templates, we must provide the manifests that will be generated as an output.
For example, here is a simple template manifest example:

`deployment.yaml`

```yaml
apiVersion: apps/v1
metadata:
kind: Deployment
name: [[forms[0].name]]

```

The `[[forms[0].name]]` parameter will be interpolated based on the input received from the forms.  
In this specific example, it will insert the value of the `name` property from the first form.

Then, using the `manifests` property from the monokle-template file, we will specify the above template manifest like this:

```json
{
  "manifests": [
    {
      "filePath": "deployment.yaml"
    }
  ]
}
```

#### Referenced helm chart templates

The value of the `type` property from `monokle-template.json` is `"helm-chart"`.

Example of `monokle-template.json`:

```json
{
  "name": "Minecraft Server (Test Plugin)",
  "id": "com.github.devcatalin.monokle-test-plugin.minecraft",
  "author": "Catalin",
  "version": "1.0.1",
  "description": "Create your own Minecraft server",
  "type": "helm-chart",
  "forms": [
    {
      "name": "Minecraft Server",
      "description": "Default settings for your Minecraft Server",
      "schema": "form-schema.json",
      "uiSchema": "form-ui-schema.json"
    }
  ],
  "valuesFilePath": "values.yaml",
  "chartName": "minecraft",
  "chartVersion": "3.6.1",
  "chartRepo": "https://itzg.github.io/minecraft-server-charts/",
  "helpUrl": "https://artifacthub.io/packages/helm/minecraft-server-charts/minecraft"
}
```

In this example we can see the first part of the file looks similar to the vanilla templates.  
The difference between a vanilla template and a helm chart template is that, for helm chart templates we do not specify a `manifests` array, but we specifying information about the chart.

The properties `chartName`, `chartVersion`, `chartRepo` are used to identify the helm chart.

This type of template must bundle a `values.yaml` file which can contain properties that will be interpolated with values from the forms.

For example we could have the following `values.yaml` in the template folder:

`values.yaml`

```yaml
version: [[forms[0].version]]
maxPlayers: [[forms[0].maxPlayers]]
```

Then, in the `monokle-template.json` example from above, we notice a `valuesFilePath` which specifies the path to the values file that will be interpolated with values from the forms, and then used by helm to generate the output resources.

### <a name="installation">How do I install a Template?</a>

Templates can be installed via Plugins.  
Read the [How to install a Plugin](./plugins.md#installation) section from [Plugins overview](./plugins.md).
Note: A plugin can contain one or multiple templates.
