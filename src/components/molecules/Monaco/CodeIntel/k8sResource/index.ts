import {monaco} from 'react-monaco-editor';

import {CodeIntelApply} from '@molecules/Monaco/CodeIntel/types';
import {processSymbols} from '@molecules/Monaco/symbolProcessing';

import applyErrorIntel from './applyErrorIntel';
import applyPolicyIntel from './applyPolicyIntel';
import applyRefIntel from './applyRefIntel';

export const resourceCodeIntel: CodeIntelApply = {
  name: 'resource',
  shouldApply: params => {
    return Boolean(params.selectedResource);
  },
  codeIntel: async ({
    resource,
    selectResource,
    selectFilePath,
    createResource,
    filterResources,
    selectImageHandler,
    resourceMap,
    fileMap,
    model,
  }) => {
    const disposables: monaco.IDisposable[] = [];
    const decorations: monaco.editor.IModelDeltaDecoration[] = [];
    const markers: monaco.editor.IMarkerData[] = [];

    if (model) {
      await processSymbols(model, resource, filterResources, disposables, decorations);
    }

    const refIntel = applyRefIntel(
      resource,
      selectResource,
      selectFilePath,
      createResource,
      selectImageHandler,
      resourceMap,
      fileMap
    );
    disposables.push(...refIntel.disposables);
    decorations.push(...refIntel.decorations);

    const errorIntel = applyErrorIntel(resource);
    decorations.push(...errorIntel.decorations);

    const policyIntel = applyPolicyIntel(resource);
    decorations.push(...policyIntel.decorations);
    markers.push(...policyIntel.markers);

    return {
      newDecorations: decorations,
      newDisposables: disposables,
      newMarkers: markers,
    };
  },
};
