<p align="center">
  <img src="src/assets/MonokleLogoLight.svg#gh-light-mode-only" alt="Monokle Logo Light"/>
  <img src="src/assets/MonokleLogoDark.svg#gh-dark-mode-only" alt="Monokle Logo Dark" />
</p>

<p align="center">
  <a href="https://monokle.io">Website</a> |
  <a href="https://kubeshop.github.io/monokle/">Documentation</a> |
  <a href="https://discord.gg/uNuhy6GDyn">Discord</a> |
  <a href="https://kubeshop.io/blog">Blog</a>
</p>

<p align="center">
  Welcome to Monokle Desktop 🧐 - K8s configuration analysis and version control editor!
</p>

<p align="center">
  <a href="https://github.com/kubeshop/monokle/releases/latest">
    <img src="https://img.shields.io/github/v/release/kubeshop/monokle" alt="Latest Release" />
  </a>
  <a href="https://github.com/kubeshop/monokle/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/kubeshop/monokle" alt="License" />
  </a>
  <a href="https://discord.gg/kMJxmuYTMu">
    <img src="https://badgen.net/badge/icon/discord?icon=discord&label" alt="Discord" />
  </a>
  <a href="https://github.com/kubeshop/monokle/tags">
    <img src="https://img.shields.io/github/workflow/status/kubeshop/monokle/monokle-build-nightly?label=nightly-build" alt="Nightly Build" />
  </a>
  <a href="https://snyk.io/test/github/kubeshop/monokle">
    <img src="https://snyk.io/test/github/kubeshop/monokle/badge.svg" alt="Snyk" />
  </a>
</p>

<p align="center">
  <a href="https://www.youtube.com/watch?v=wkFWg_S8eUA">
    <img src="docs/img/monokle-intro-thumbnail.png" alt="Monokle Desktop Overview" />
    <p align="center">Click on the image or this link to watch the "Intro to Monokle Dekstop" short video (3 mins)</p>
  </a>
</p>

## Core Features

- ⚡ Quickly get a high-level view of your manifests, their contained resources and relationships
- 📇 Leverage Git to manage the lifecycle of your configuration
- ✅ Validate resources using OPA policy rules
- 🖊️ Easily edit resources without having to learn or look up yaml syntax and see the changes applied
- 🔨 Refactor resources with maintained integrity of names and references
- 📷 Preview and debug resources generated with kustomize or helm
- ➕ Visualize extended resources defined in CRD
- 🤝 Compare resource versions against your cluster and apply changes immediately or through pull requests
- 📚 Create multi-step forms using Monokle's templating system to quickly generate manifests
- 💡 And much more, check out the [Documentation](https://kubeshop.github.io/monokle/)

Read the [Feature Overview](https://kubeshop.github.io/monokle/features/) document or the [introductory blog-post](https://medium.com/kubeshop-i/hello-monokle-83ecb42f5d96) to get a quick intro and overview.

## Download & Install

<table>
  <tr>
    <td>Windows</td>
    <td>MacOS</td>
    <td>Linux</td>
  </tr>
  <tr>
    <td>
      <p align="center">
        <img src="docs/img/windows.svg" height="50" width="50" /></p>
      </p>
    </td>
    <td>
      <p align="center">
        <img src="docs/img/macos.svg" height="50" width="50" />
      </p>
    </td>
    <td>
      <p align="center">
        <img src="docs/img/linux.svg" height="50" width="50" />
      </p>
    </td>
  </tr>
  <tr>
    <td>
      <a href="https://github.com/kubeshop/monokle/releases/download/downloads/Monokle-win-x64.exe">Download .exe</a>
    </td>
    <td>
      <a href="https://github.com/kubeshop/monokle/releases/download/downloads/Monokle-mac-universal.dmg">Download .dmg</a>
    </td>
    <td>
      <a href="https://github.com/kubeshop/monokle/releases/download/downloads/Monokle-linux-x86_64.AppImage">Download .appImage</a>
    </td>
  </tr>
</table>

## Roadmap

There is a lot of functionality currently being considered:

- A new streamlined interface that works better for git flows and complex configuration scenarios, where congnitive load is high
- Additional work on the git and gitops flows, including conflict management and pull request creation
- Better CRD management
- A CLI
- Remote management
- Drift analysis
- Integration to other open source projects around K8s
- Advanced creator mode

Don't hesitate to provide any feedback you might have to help us prioritize and improve our backlog!


## Getting involved

- Share ideas, suggestions, bug-reports or complaints on our [Discord server](https://discord.gg/uNuhy6GDyn).
- Read about how to contribute [in our Documentation](https://kubeshop.github.io/monokle/contributing).
