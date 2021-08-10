# Monokle

Welcome to Monokle - your friendly desktop UI for managing k8s manifests!

Check out our [Features Document](./docs/features.md) or watch our demo video.

[Hello Monokle Video](https://drive.google.com/file/d/1E6MkT0WVwEoV5YYq-_yrpPhk5uMgsPDS/view)

## Getting Started

Either download an (as of yet unsigned) installer from [releases](https://github.com/kubeshop/monokle/releases) or
clone/build as described below!

- Read the [introductory blog-post](https://medium.com/kubeshop-i/hello-monokle) to get a quick intro and overview
- Ask questions, report bugs, suggest features, join our discussions
  [here on GitHub](https://github.com/kubeshop/monokle/discussions)
- See "Getting Involved" below on how to get involved!

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
