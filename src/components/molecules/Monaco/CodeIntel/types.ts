import {monaco} from 'react-monaco-editor';

import {
  FileMapType,
  HelmChartMapType,
  HelmTemplatesMapType,
  HelmValuesMapType,
  ResourceFilterType,
  ResourceMapType,
} from '@models/appstate';
import {CurrentMatch, FileEntry} from '@models/fileentry';
import {K8sResource, ResourceRef} from '@models/k8sresource';
import {MonacoUiState} from '@models/ui';

export interface CodeIntelResponse {
  newDecorations: monaco.editor.IModelDeltaDecoration[];
  newDisposables: monaco.IDisposable[];
  newMarkers?: monaco.editor.IMarkerData[];
}

export interface ShouldApplyCodeIntelParams {
  selectedResource?: K8sResource;
  currentFile?: FileEntry;
  helmValuesMap?: HelmValuesMapType;
  matchOptions?: CurrentMatch | null;
  isSearchActive?: boolean;
}

export interface CodeIntelParams {
  selectedResource?: K8sResource;
  currentFile?: FileEntry;
  helmValuesMap?: HelmValuesMapType;
  helmChartMap?: HelmChartMapType;
  helmTemplatesMap?: HelmTemplatesMapType;
  selectFilePath: (filePath: string) => void;
  code?: string;
  fileMap: FileMapType;
  setEditorSelection: (selection: Partial<MonacoUiState>) => void;
  resource: K8sResource;
  selectResource: (resourceId: string) => void;
  createResource: ((outgoingRef: ResourceRef, namespace?: string, targetFolderget?: string) => void) | undefined;
  filterResources: (filter: ResourceFilterType) => void;
  selectImageHandler: (imageId: string) => void;
  resourceMap: ResourceMapType;
  model: monaco.editor.IModel | null;
  matchOptions?: CurrentMatch | null;
  lastChangedLine: number;
}

export interface CodeIntelApply {
  shouldApply: (params: ShouldApplyCodeIntelParams) => boolean;
  codeIntel: (params: CodeIntelParams) => Promise<CodeIntelResponse | undefined>;
  name: string;
}
