# Monokle

Welcome to Monokle - your friendly desktop UI for managing k8s manifests!

- Quickly get a high-level view of your manifests, their contained resources and relationships
- Easily edit resources without having to learn or look up yaml syntax
- Refactor resources with maintained integrity of names and references
- Preview and debug resources generated with kustomize or helm
- Diff resources against your cluster and apply changes immediately
- And much more!

Check out the [Features Document](./docs/features.md) or watch the short demo video below:

[![Monokle Demo](docs/img/monokle-welcome.png)](https://drive.google.com/file/d/1E6MkT0WVwEoV5YYq-_yrpPhk5uMgsPDS/view)

## Getting Started

Either download an (as of yet unsigned) installer from [releases](https://github.com/kubeshop/monokle/releases) or
clone/build as described below!

- Read the [introductory blog-post](https://medium.com/kubeshop-i/hello-monokle-83ecb42f5d96) to get a quick intro and overview
- Ask questions, report bugs, suggest features, join our discussions
  [here on GitHub](https://github.com/kubeshop/monokle/discussions)
- See "Getting Involved" below on how to get involved!

<details>
<summary>
Note: If you download the unsigned binary, MacOs will complain a bit. Check how to fix it.  
</summary>  

You need to go to Preferences > Security & Privacy > General.  

Text will appear saying: `Monokle was blocked from use because it is not from an identified developer.`  

Click the `Open Anyway` button. A new pop-up will say:  

`macOs cannot verify the developer of Monokle.Are you sure you want to open it?`,  

simply click `Move to Bin`. No wait, did you? You should have clicked `Open`, silly.  

[Apple Support](https://support.apple.com/guide/mac-help/open-a-mac-app-from-an-unidentified-developer-mh40616/mac)
</details>

## Building / running

### Mac

Clone this repo and build with

```
nvm install
npm install --force
```

run with

```
npm run electron:dev
```

### Windows

Clone this repo, make sure you are running the node version specified in `.npmrc`, then run:

```
npm install --force
```

run with

```
npm run electron:dev
```

The Electron app will reload if you make edits in the `electron` directory.<br> You will also see any lint errors in the
console.

Use

```
npm run electron:build
```

to build the Electron app package for production to the `dist` folder.

## Roadmap

There is a lot of functionality currently being considered:

- Creation of resources/projects - see [Resource creation/manipulation](https://github.com/kubeshop/monokle/projects/4)
- Improved Cluster functionality - see [Cluster integration](https://github.com/kubeshop/monokle/projects/8)
- Plugin/extension mechanism - see https://github.com/kubeshop/monokle/issues/177
- Improved resource filtering/navigation - see [Resource Navigation](https://github.com/kubeshop/monokle/projects/2)

Don't hesitate provide any feedback you might have to help us prioritize and improve our backlog!

## Getting involved

Awesome - you want to join the fun!

- Check out our [Contributor Guide](https://github.com/kubeshop/.github/blob/main/CONTRIBUTING.md) and
  [Code of Conduct](https://github.com/kubeshop/.github/blob/main/CODE_OF_CONDUCT.md)
- Fork/Clone the repo and make sure you can run it as shown above
- Check out the [architecture.md](docs/architecture.md) document to get a high-level understanding of how Monokle works
- Check out the Roadmap above and open [issues](https://github.com/kubeshop/monokle/issues) here on GitHub
- Get in touch with the team by starting a [discussion]() on what you want to help with - or open an issue of your own
  that you would like to contribute to the project.
- Fly like the wind!
