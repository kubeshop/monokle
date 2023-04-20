import * as monaco from 'monaco-editor';

import {selectFile, selectImage, selectResource} from '@redux/reducers/main';
import {getResourceMetaFromState} from '@redux/selectors/resourceGetters';

import {addEditorCommand, addEditorHover, addEditorLink, setEditorDecorations} from '@src/editor/editor.instance';

import {GlyphDecorationTypes} from '@editor/editor.constants';
import {EditorCommand} from '@editor/editor.types';
import {createGlyphDecoration, createMarkdownString} from '@editor/editor.utils';
import {ResourceRef, ResourceRefType} from '@monokle/validation';
import {AppDispatch} from '@shared/models/appDispatch';
import {FileMapType} from '@shared/models/appState';
import {ResourceMeta, ResourceMetaMap, isLocalResourceMeta} from '@shared/models/k8sResource';

import {createEditorEnhancer} from '../createEnhancer';

export const applyEditorRefs = createEditorEnhancer(({state, resourceIdentifier, dispatch}) => {
  if (!resourceIdentifier) {
    return;
  }
  const resourceMeta = getResourceMetaFromState(state, resourceIdentifier);
  const refs = resourceMeta?.refs ?? [];
  if (!resourceMeta || !refs || refs.length === 0) {
    return;
  }

  for (const ref of refs) {
    const position = ref.position;
    if (position) {
      const range = new monaco.Range(position.line, position.column, position.line, position.column + position.length);
      addEditorLinkForRef({resourceMeta, ref, range, dispatch});
      const editorCommand = addEditorCommandForRef({
        resourceMetaMap: state.main.resourceMetaMapByStorage[resourceMeta.storage],
        fileMap: state.main.fileMap,
        resourceMeta,
        ref,
        dispatch,
      });
      createEditorHoverForRef({
        ref,
        range,
        hoverContents: editorCommand?.markdownLink ? [editorCommand.markdownLink] : [],
      });
      const decorations = createEditorDecorationsForRef({ref});
      setEditorDecorations(decorations);
    }
  }
});

const createEditorDecorationsForRef = (args: {ref: ResourceRef}): monaco.editor.IModelDeltaDecoration[] => {
  const {ref} = args;
  if (!ref.position) {
    return [];
  }
  const glyphDecoration = createGlyphDecoration(
    ref.position.line,
    ref.type === ResourceRefType.Outgoing
      ? ref.target?.type === 'image'
        ? GlyphDecorationTypes.OutgoingImageRef
        : GlyphDecorationTypes.OutgoingRef
      : GlyphDecorationTypes.IncomingRef
  );
  return [glyphDecoration];
};

const createEditorHoverForRef = (args: {
  ref: ResourceRef;
  range: monaco.IRange;
  hoverContents?: monaco.IMarkdownString[];
}) => {
  const {ref, range, hoverContents} = args;
  const hoverTitle =
    ref.type === ResourceRefType.Outgoing
      ? ref.target?.type === 'image'
        ? 'Outgoing Image Link'
        : 'Outgoing Link'
      : ref.type === ResourceRefType.Incoming
      ? 'Incoming Link'
      : 'Unsatisfied Link';

  const contents = [createMarkdownString(hoverTitle), ...(hoverContents ?? [])];
  addEditorHover({
    range,
    contents,
  });
};

const addEditorCommandForRef = (args: {
  resourceMetaMap: ResourceMetaMap;
  fileMap: FileMapType;
  resourceMeta: ResourceMeta;
  ref: ResourceRef;
  dispatch: AppDispatch;
}) => {
  const {resourceMetaMap, fileMap, resourceMeta, ref, dispatch} = args;
  if (!ref.target) {
    return;
  }
  let command: EditorCommand | undefined;
  if (ref.target.type === 'resource' && ref.target.resourceId) {
    const outgoingRefResourceMeta = resourceMetaMap[ref.target.resourceId];
    if (!outgoingRefResourceMeta) {
      return;
    }
    let text = `${outgoingRefResourceMeta.kind}: ${outgoingRefResourceMeta.name}`;
    if (isLocalResourceMeta(outgoingRefResourceMeta)) {
      text += ` in ${outgoingRefResourceMeta.origin.filePath}`;
    }
    command = addEditorCommand({
      text,
      altText: 'Select resource',
      handler: () => {
        if (ref.target && 'resourceId' in ref.target) {
          dispatch(
            selectResource({resourceIdentifier: {id: (ref.target as any).resourceId, storage: resourceMeta.storage}})
          );
        }
      },
    });
  } else if (ref.target.type === 'file') {
    const outgoingRefFile = fileMap[ref.target.filePath];
    if (!outgoingRefFile) {
      return;
    }
    command = addEditorCommand({
      text: `Open ${outgoingRefFile.name}`,
      altText: 'Select file',
      handler: () => {
        if (ref.target && 'filePath' in ref.target) {
          dispatch(selectFile({filePath: ref.target.filePath}));
        }
      },
    });
  }
  return command;
};

const addEditorLinkForRef = (args: {
  resourceMeta: ResourceMeta;
  ref: ResourceRef;
  range: monaco.IRange;
  dispatch: AppDispatch;
}) => {
  const {resourceMeta, ref, range, dispatch} = args;
  const tooltip = ref.target?.type === 'image' ? 'Select image' : 'Open resource';
  addEditorLink({
    range,
    tooltip,
    handler: () => onClickRefLink({resourceMeta, ref, dispatch}),
  });
};

const onClickRefLink = (args: {resourceMeta: ResourceMeta; ref: ResourceRef; dispatch: AppDispatch}) => {
  const {resourceMeta, ref, dispatch} = args;
  if (ref.target?.type === 'resource' && ref.target.resourceId) {
    // is the storage of the target resource the same as the current resource?
    dispatch(selectResource({resourceIdentifier: {id: ref.target.resourceId, storage: resourceMeta.storage}}));
  } else if (ref.target?.type === 'file' && ref.target.filePath) {
    dispatch(selectFile({filePath: ref.target.filePath}));
  } else if (ref.target?.type === 'image') {
    dispatch(selectImage({imageId: `${ref.name}:${ref.target?.tag}`}));
  }
};
