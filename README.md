
![Monokle Logo Light](src/assets/MonokleLogoLight.svg#gh-light-mode-only)
![Monokle Logo Dark](src/assets/MonokleLogoDark.svg#gh-dark-mode-only)

<p align="center">
  <a href="https://monokle.io">Website</a> |
  <a href="https://kubeshop.github.io/monokle/">Documentation</a> |
  <a href="https://discord.com/invite/6zupCZFQbe">Discord</a> |
  <a href="https://monokle.io/blog">Blog</a>
</p>

<p align="center">
  🧐 Monokle streamlines the process of creating, analyzing, and deploying Kubernetes configurations by providing a unified visual tool for authoring YAML manifests, validating policies, and managing live clusters. 
</p>

<p align="center">
  <a href="https://github.com/kubeshop/monokle/releases/latest">
    <img src="https://img.shields.io/github/v/release/kubeshop/monokle" alt="Latest Release" />
  </a>
  <a href="https://github.com/kubeshop/monokle/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/kubeshop/monokle" alt="License" />
  </a>
  <a href="https://discord.gg/CzpqtfPjXV">
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
  <a href="http://youtu.be/y3GLmTsna1M">
    <img src="https://res.cloudinary.com/duczlt4nw/image/upload/v1677516135/YouTube_Thumbnail_17_hxccnv.png">
    <p align="center">Click on the image or <a href="http://youtu.be/y3GLmTsna1M">this link</a> to watch the "Intro to Monokle" short video (4 mins)</p>
  </a>
</p>

## Core Features

- 👩‍💻 Single IDE for your configuration files, manifests, resources and cluster management
- 🌤️ Connect to your clusters and see real time state and resources
-  ⚡ Quickly get a high-level view of your manifests, their contained resources and relationships
- 📇 Leverage Git to manage the lifecycle of your configuration
- 👌 Validate your manifests in real time against YAML formatting, K8s schemas including CRD installed,  and easily follow links
- ✅ Validate resources using OPA policy rules or define your own
- 🖊️ Easily edit and create resources without having to learn or look up yaml syntax and see the changes applied
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
      <div align="center"><a href="https://github.com/kubeshop/monokle/releases/download/downloads/Monokle-win-x64.exe">
        <img src="docs/docs/img/windows.svg" height="50" width="50" /></a>
      </div>
    </td>
    <td>
      <div align="center">
         <a href="https://github.com/kubeshop/monokle/releases/download/downloads/Monokle-mac-universal.dmg"><img src="docs/docs/img/macos.svg" height="50" width="50" /></a>
      </div>
    </td>
    <td>
      <div align="center">
       <a href="https://github.com/kubeshop/monokle/releases/download/downloads/Monokle-linux-x86_64.AppImage"><img src="docs/docs/img/linux.svg" height="50" width="50" /></a>
      </div>
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
      <a href="https://github.com/kubeshop/monokle/releases/tag/downloads">Download .rpm/.deb/.appImage </a>
    </td>
  </tr>
</table>

## Roadmap

Our roadmap is always being updated and improved:

- A new streamlined interface that works better for git flows and complex configuration scenarios, where cognitive load is high
- Additional work on the git and gitops flows, including conflict management and pull request creation
- Better CRD management
- A CLI
- Advanced features for cluster management
- Drift analysis
- Integration to other open source projects about configuration for K8s
- Improved templates for K8s resources, CRD, and Helm and Kustomize

Don't hesitate to provide any feedback you might have to help us prioritize and improve our backlog!

## Getting involved

- Share ideas, suggestions, bug-reports or complaints on our [Discord server](https://discord.com/invite/6zupCZFQbe).
- Read about how to contribute [in our Documentation](https://kubeshop.github.io/monokle/contributing).
