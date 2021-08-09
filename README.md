# Monokle

Welcome to Monokle - your friendly desktop UI for managing k8s manifests!

[Hello Monokle Video]

## Features

Check out our feature list under docs. [Features](./docs/features.md)

## Getting Started

Either download an (as of yet unsigned) installer from [releases](https://github.com/kubeshop/monokle/releases) or
clone/build as described below!

- Check out the [monokle.io website](https://monokle.io) for introductory material and videos.
- Read the [introductory blog-post](https://medium.com/kubeshop-i/hello-monokle) to get a quick intro and overview
- Ask question, report bugs, suggest features, join our discussions
  [here on GitHub](https://github.com/kubeshop/monokle/discussions)
- See "Getting Involved" below on how to get started with contributions

## Building

Clone this repo and build with

```
nvm install
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

## Getting involved

Awesome - you want to join the fun! 

- Fork/Clone the repo and make sure you can run it as shown above
- Check out the [architecture.md](docs/architecture.md) document to get a high-level understanding of 
  how monokle works
- Check out open [issues](https://github.com/kubeshop/monokle/issues) and get in touch with the team 
  by starting a [discussion]() on what you want to help with - or open an issue of your own that you would
  like to contribute to the project.
- Fly like the wind!
