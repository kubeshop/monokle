import {monaco} from 'react-monaco-editor';

import {ResourceRef} from '@monokle/validation';
import {
  FileMapType,
  HelmChartMapType,
  HelmTemplatesMapType,
  HelmValuesMapType,
  ResourceFilterType,
} from '@shared/models/appState';
import {FileEntry} from '@shared/models/fileEntry';
import {
  K8sResource,
  ResourceIdentifier,
  ResourceMeta,
  ResourceMetaMap,
  ResourceStorage,
} from '@shared/models/k8sResource';
import {MonacoUiState} from '@shared/models/ui';

export interface CodeIntelResponse {
  newDecorations: monaco.editor.IModelDeltaDecoration[];
  newDisposables: monaco.IDisposable[];
  newMarkers?: monaco.editor.IMarkerData[];
}

export interface ShouldApplyCodeIntelParams {
  selectedResourceMeta?: ResourceMeta;
  currentFile?: FileEntry;
  helmValuesMap?: HelmValuesMapType;
}

export interface CodeIntelParams {
  selectedResourceMeta?: ResourceMeta;
  currentFile?: FileEntry;
  helmValuesMap?: HelmValuesMapType;
  helmChartMap?: HelmChartMapType;
  helmTemplatesMap?: HelmTemplatesMapType;
  selectFilePath: (filePath: string) => void;
  code?: string;
  fileMap: FileMapType;
  setEditorSelection: (selection: Partial<MonacoUiState>) => void;
  resource?: K8sResource;
  selectResource: (resourceIdentifier: ResourceIdentifier) => void;
  createResource: ((outgoingRef: ResourceRef, namespace?: string, targetFolderget?: string) => void) | undefined;
  filterResources: (filter: ResourceFilterType) => void;
  selectImageHandler: (imageId: string) => void;
  resourceMetaMap: ResourceMetaMap;
  model: monaco.editor.IModel | null;
  lastChangedLine: number;
  activeResourceStorage: ResourceStorage;
}

export interface CodeIntelApply {
  shouldApply: (params: ShouldApplyCodeIntelParams) => boolean;
  codeIntel: (params: CodeIntelParams) => Promise<CodeIntelResponse | undefined>;
  name: string;
}
