/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    {type: 'doc', label: 'Welcome', id: 'index'},
    {type: 'doc', label: 'Introducing Monokle Desktop and Monokle Cloud', id: 'desktop-v-SAAS'},
    {type: 'doc', label: 'Getting Started', id: 'getting-started'},
    {type: 'doc', label: 'Feature Overview', id: 'features'},
    {type: 'doc', label: 'UI Overview', id: 'overview'},
    {type: 'doc', label: 'Working with File Explorer', id: 'file-explorer'},
    {type: 'doc', label: 'Integration with Git', id: 'git-integration'},
    {type: 'doc', label: 'Working with the Form Editor', id: 'tutorials/how-to-create-and-edit-configmap'},
    {
      type: 'category',
      label: 'Working with Resources',
      items: [
        'resource-navigation',
        'creating-resources',
        'resource-editing',
        'working-with-multiple-resources',
        'resource-crds',
      ],
    },
    {type: 'doc', label: 'Working with Projects', id: 'projects'},
    {type: 'doc', label: 'Working with Images', id: 'images'},
    {type: 'doc', label: 'Working with Kustomize', id: 'kustomize'},
    {type: 'doc', label: 'Working with Helm Charts', id: 'helm'},
    {
      type: 'category',
      label: 'Working with Cluster',
      items: ['cluster-integration', 'cluster-mode', 'cluster-issues'],
    },
    {
      type: 'category',
      label: 'Compare & Sync',
      items: ['compare-sync', 'compare-subfolders'],
    },
    {type: 'doc', label: 'Deploy/Diff', id: 'apply-and-diff'},
    {
      type: 'category',
      label: 'Development',
      items: ['development', 'architecture', 'testing', 'contributing'],
    },
    {
      type: 'category',
      label: 'Monokle Plugins',
      items: ['plugins', 'templates'],
    },
    {type: 'doc', label: 'Keyboard Shortcuts', id: 'hotkeys'},
    {type: 'doc', label: 'FAQ', id: 'faq'},
    {type: 'doc', label: 'Telemetry', id: 'telemetry'},
    {
      type: 'category',
      label: 'Tutorials',
      items: [
        'tutorials/how-to-configure-monokle',
        'tutorials/how-to-navigate-and-edit-manifests',
        'tutorials/how-to-browse-clusters',
        'tutorials/how-to-create-and-edit-configmap',
        'tutorials/how-to-fix-broken-links',
      ],
    },
  ],
};

module.exports = sidebars;
