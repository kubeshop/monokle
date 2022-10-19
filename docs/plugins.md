# What is a Plugin?

Simply, any GitHub repository that contains a `package.json` file (the plugin entry file) can be installed as a plugin if the entry file follows the structure of a Monokle Desktop plugin.

## **What is the structure of `package.json` for a valid Monokle Desktop plugin?**

Monokle Desktop uses the following properties: `name`, `author`, `version` `repository`, `description`, and `monoklePlugin`.

The `monoklePlugin` property should be an object containing an array named `modules`.

Here’s an example of a `package.json` for a Monokle Desktop plugin:

```json
{
  "name": "My first plugin",
  "description": "Hello world!",
  "version": "1.0.0",
  "author": "Kubeshop",
  "repository": "https://github.com/kubeshop/monokle-default-templates-plugin",
  "monoklePlugin": {
    "modules": []
  }
}
```

## **What types of modules does a Plugin support or what does a module look like?**

With the release of 1.5.0 we are only supporting Template modules.  
More module types will be added in future versions.

Each plugin may have multiple modules.

Here is how you can reference a template module:

```json
"monoklePlugin": {
    "modules": [
        {
            "type": "template",
            "path": "<relative-path-to-template-folder>"
        }
    ]
}
```

[Read more about templates here.](./templates.md)

## **How do I install a Plugin?**

Open the Plugins manager from the top right icon:

![Open Plugin Manager](img/open-plugin-manager-1.11.png)


1. Click on the **+ Install** button:

![Add New Plugin](img/add-new-plugin-1.11.png)

2. A modal will appear asking for the Plugin URL:

![Add Plugin Modal](img/add-plugin-modal-1.6.0.png)


- The URL must be a valid GitHub repository url in the format https://github.com/[user]/[repository].
- The primary branch should be `main`. The plugin installer will search there for the `package.json` file.

## **How do I manually install a Plugin?**

This should be used only as a workaround for developing plugins.

On Mac:

- Copy your plugin folder to `/Users/<YourUser>/Libray/Application Support/monokle/monoklePlugins`.
- Reopen or reload Monokle Desktop (from Window -> Reload).

On Windows:

- Copy your plugin folder to `C:\Users\<YourUser>\AppData\Roaming\monokle\monoklePlugins`.
- Reopen or reload Monokle Desktop (from Window -> Reload).
