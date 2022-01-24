### What is a Plugin?

Simply, any GitHub repository that contains a `package.json` file (the plugin entry file) can be installed as a plugin if the entry file follows the structure of a Monokle plugin.

### What’s the structure of `package.json` for a valid Monokle plugin?

Monokle uses the following properties: `name`, `author`, `version` `repository`, `description`, `monoklePlugin`.

The `monoklePlugin` property should be an object containing an array named `modules`.

Here’s an example of a `package.json` for a Monokle plugin:

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

### What types of modules does a Plugin support or what does a module look like?

With the release of 1.5.0 we are only supporting Template modules.  
More module types will be added in future versions.

Note: One plugin can have multiple modules.

Here’s how you can reference a template module:

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

### <a name="installation">How do I install a Plugin?</a>

Open the Plugins manager from the top right icon

1. Click on the + button
2. A modal will show up asking for the Plugin URL.

- The URL must be a valid GitHub repository url in the format https://github.com/[user]/[repository]
- The primary branch should be `main`, that’s where the plugin installer will search for the `package.json` file
