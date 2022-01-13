# Monokle

[![Release](https://img.shields.io/github/v/release/kubeshop/monokle)](<[https://](https://github.com/kubeshop/monokle/releases/latest)>)
[![License](https://img.shields.io/github/license/kubeshop/monokle)](https://github.com/kubeshop/monokle/blob/main/LICENSE)
[![Discord](https://badgen.net/badge/icon/discord?icon=discord&label)](https://discord.gg/kMJxmuYTMu)
[![Nightly Build](https://img.shields.io/github/workflow/status/kubeshop/monokle/monokle-build-nightly?label=nightly-build)](https://github.com/kubeshop/monokle/tags)
[![Known Vulnerabilities](https://snyk.io/test/github/kubeshop/monokle/badge.svg)](https://snyk.io/test/github/kubeshop/monokle)

Welcome to Monokle - your friendly desktop UI for managing k8s manifests!

> Read the [1.4.0 Release blog-post](https://medium.com/kubeshop-i/monokle-1-4-0-4122e88742c5)

![Monokle Overview](docs/img/monokle-overview.gif)

- Quickly get a high-level view of your manifests, their contained resources and relationships
- Easily edit resources without having to learn or look up yaml syntax
- Refactor resources with maintained integrity of names and references
- Preview and debug resources generated with kustomize or helm
- Diff resources against your cluster and apply changes immediately
- And much more, check out the [Documentation](https://kubeshop.github.io/monokle/)

Read the [Feature Overview](https://kubeshop.github.io/monokle/features/) document or the [introductory blog-post](https://medium.com/kubeshop-i/hello-monokle-83ecb42f5d96) to get a quick intro and overview.

## Download & Install

Download and install the latest version below

### macOS

[**Download**](https://github.com/kubeshop/monokle/releases/latest) the `.dmg` file

### Windows

[**Download**](https://github.com/kubeshop/monokle/releases/latest) the `.exe` file

### Linux (since Monokle 1.3.0)

[**Download**](https://github.com/kubeshop/monokle/releases/latest) the `.appImage`/`.deb` file for your platform

## Roadmap

There is a lot of functionality currently being considered:

- Creation of resources/projects - see [Resource creation/manipulation](https://github.com/kubeshop/monokle/projects/4)
- Improved Cluster functionality - see [Cluster integration](https://github.com/kubeshop/monokle/projects/8)
- Plugin/extension mechanism - see https://github.com/kubeshop/monokle/issues/177
- Improved resource filtering/navigation - see [Resource Navigation](https://github.com/kubeshop/monokle/projects/2)
- Improved Helm integration - see [Helm integration](https://github.com/kubeshop/monokle/projects/12)

Don't hesitate provide any feedback you might have to help us prioritize and improve our backlog!

## Getting involved

- We WANT and NEED your feedback please. Share ideas, suggestions, bug-reports or complaints on our [Discord server](https://discord.gg/uNuhy6GDyn)
- Check out our [Contributor Guide](https://github.com/kubeshop/.github/blob/main/CONTRIBUTING.md) and
  [Code of Conduct](https://github.com/kubeshop/.github/blob/main/CODE_OF_CONDUCT.md)
- Fork/Clone the repo and make sure you can run it as shown above
- Check out the [Development](docs/development.md) document for how to build and run Monokle from its source
- Check out the [Architecture](docs/architecture.md) document to get a high-level understanding of how Monokle works
- Check out the Roadmap above and open [issues](https://github.com/kubeshop/monokle/issues) here on GitHub

