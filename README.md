# Monokle

[![Discord](https://badgen.net/badge/icon/discord?icon=discord&label)](https://discord.gg/kMJxmuYTMu)
[![Known Vulnerabilities](https://snyk.io/test/github/kubeshop/monokle/badge.svg)](https://snyk.io/test/github/kubeshop/monokle)

Welcome to Monokle - your friendly desktop UI for managing k8s manifests!

> Read the [1.2.0 Release blog-post](https://medium.com/kubeshop-i/monokle-1-2-0-is-out-2492341f0874)

- Quickly get a high-level view of your manifests, their contained resources and relationships
- Easily edit resources without having to learn or look up yaml syntax
- Refactor resources with maintained integrity of names and references
- Preview and debug resources generated with kustomize or helm
- Diff resources against your cluster and apply changes immediately
- And much more...

Read the [Feature Overview](./docs/features.md) or watch the
[Monokle 1.0 walkthrough video](https://youtu.be/9c80qj9NkQk) (approx 13 minutes):

[![Monokle 1.0 Walkthrough](docs/img/monokle-welcome.png)](https://youtu.be/9c80qj9NkQk)

## Getting Started

Either download an installer from [releases](https://github.com/kubeshop/monokle/releases) or
clone/build as described below.

- Read the [introductory blog-post](https://medium.com/kubeshop-i/hello-monokle-83ecb42f5d96) to get a quick intro and
  overview
- Ask questions, report bugs, suggest features, join our discussions
  [here on GitHub](https://github.com/kubeshop/monokle/discussions)
- See "Getting Involved" below on how to get involved!

> Don't hesitate to say hi to the team and ask questions on our [Discord server](https://discord.gg/uNuhy6GDyn).

## Building / running

Clone this repo and make sure you are running the node version specified in `.npmrc`

### Mac

```
nvm install # assert nodejs version
npm install
```

run with

```
npm run electron:dev
```

### Windows

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
- Improved Helm integration - see [Helm integration](https://github.com/kubeshop/monokle/projects/12)

Don't hesitate provide any feedback you might have to help us prioritize and improve our backlog!

## Getting involved

- Check out our [Contributor Guide](https://github.com/kubeshop/.github/blob/main/CONTRIBUTING.md) and
  [Code of Conduct](https://github.com/kubeshop/.github/blob/main/CODE_OF_CONDUCT.md)
- Fork/Clone the repo and make sure you can run it as shown above
- Check out the [architecture.md](docs/architecture.md) document to get a high-level understanding of how Monokle works
- Check out the Roadmap above and open [issues](https://github.com/kubeshop/monokle/issues) here on GitHub
- Get in touch with the team by starting a [discussion]() on what you want to help with - or open an issue of your own
  that you would like to contribute to the project.
- Join our our [Discord server](https://discord.gg/uNuhy6GDyn) to get in touch with the team on any matter!
