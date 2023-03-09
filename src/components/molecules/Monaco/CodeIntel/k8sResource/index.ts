import {monaco} from 'react-monaco-editor';

import {CodeIntelApply} from '@molecules/Monaco/CodeIntel/types';
import {processSymbols} from '@molecules/Monaco/symbolProcessing';

import applyLineDecorationIntel from './applyLineDecorationIntel';
import applyRefIntel from './applyRefIntel';
import applyValidationIntel from './applyValidationIntel';

export const resourceCodeIntel: CodeIntelApply = {
  name: 'resource',
  shouldApply: params => {
    return Boolean(params.selectedResourceMeta);
  },
  codeIntel: async ({
    resource,
    selectResource,
    selectFilePath,
    createResource,
    filterResources,
    selectImageHandler,
    resourceMetaMap,
    fileMap,
    model,
    lastChangedLine,
    activeResourceStorage,
  }) => {
    const disposables: monaco.IDisposable[] = [];
    const decorations: monaco.editor.IModelDeltaDecoration[] = [];
    const markers: monaco.editor.IMarkerData[] = [];

    if (!resource) {
      return {
        newDecorations: decorations,
        newDisposables: disposables,
        newMarkers: markers,
      };
    }

    if (model) {
      await processSymbols(model, resource, filterResources, disposables, decorations);
    }

    const refIntel = applyRefIntel(
      resource,
      selectResource,
      selectFilePath,
      createResource,
      selectImageHandler,
      resourceMetaMap,
      fileMap,
      activeResourceStorage
    );
    disposables.push(...refIntel.disposables);
    decorations.push(...refIntel.decorations);

    const lineDecorationIntel = applyLineDecorationIntel(lastChangedLine);
    decorations.push(...lineDecorationIntel.decorations);

    const policyIntel = applyValidationIntel(resource);
    decorations.push(...policyIntel.decorations);
    markers.push(...policyIntel.markers);

    return {
      newDecorations: decorations,
      newDisposables: disposables,
      newMarkers: markers,
    };
  },
};
