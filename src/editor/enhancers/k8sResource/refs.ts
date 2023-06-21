import * as monaco from 'monaco-editor';

import {selectFile, selectImage, selectResource} from '@redux/reducers/main';
import {getResourceMetaFromState} from '@redux/selectors/resourceGetters';

import {
  addEditorCommand,
  addEditorDecorations,
  addEditorHover,
  addEditorLink,
  getEditorType,
} from '@src/editor/editor.instance';

import {GlyphDecorationTypes} from '@editor/editor.constants';
import {EditorCommand} from '@editor/editor.types';
import {createGlyphDecoration, createMarkdownString} from '@editor/editor.utils';
import {RefPosition, ResourceRef, ResourceRefType, areRefPosEqual} from '@monokle/validation';
import {AppDispatch} from '@shared/models/appDispatch';
import {ResourceMeta, isLocalResourceMeta} from '@shared/models/k8sResource';
import {trackEvent} from '@shared/utils';

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

  const refsByEqualPos: {
    refType: ResourceRefType;
    position: RefPosition;
    matchedRefs: ResourceRef[];
    targetType: string;
  }[] = [];

  // find refs that can be decorated
  refs.forEach(ref => {
    const refPos = ref.position;
    if (refPos) {
      const refsByEqualPosIndex = refsByEqualPos.findIndex(e => areRefPosEqual(e.position, refPos));
      if (refsByEqualPosIndex === -1) {
        refsByEqualPos.push({
          refType: ref.type,
          position: refPos,
          matchedRefs: [ref],
          targetType: ref.target?.type || '',
        });
      } else {
        refsByEqualPos[refsByEqualPosIndex].matchedRefs.push(ref);
      }
    }
  });

  refsByEqualPos.forEach(({matchedRefs, position, refType, targetType}) => {
    const range = new monaco.Range(position.line, position.column, position.line, position.column + position.length);

    // Add glyph decoration
    const glyphDecoration = createGlyphDecoration(
      position.line,
      refType === ResourceRefType.Unsatisfied
        ? GlyphDecorationTypes.UnsatisfiedRef
        : refType === ResourceRefType.Outgoing
        ? targetType === 'image'
          ? GlyphDecorationTypes.OutgoingImageRef
          : GlyphDecorationTypes.OutgoingRef
        : GlyphDecorationTypes.IncomingRef
    );
    addEditorDecorations([glyphDecoration]);

    const incomingRefsMarkdownTableRows: string[] = [];
    const outgoingRefsMarkdownTableRows: string[] = [];
    matchedRefs.forEach(ref => {
      const editorCommand = addEditorCommandForRef({
        resourceMeta,
        ref,
        dispatch,
      });
      if (ref.type === ResourceRefType.Unsatisfied) {
        return;
      }

      let markdown: string | undefined;

      if (ref.target?.type === 'resource' && ref.target.resourceId) {
        const targetResourceMeta = state.main.resourceMetaMapByStorage[resourceMeta.storage][ref.target.resourceId];

        if (!targetResourceMeta) {
          return;
        }

        markdown = `
<li>Resource
  <ul>
    <li>Name: <strong>${targetResourceMeta.name}</strong></li>
    <li>Kind: ${targetResourceMeta.kind}</li>
    ${isLocalResourceMeta(targetResourceMeta) ? `<li>File path: ${targetResourceMeta.origin.filePath}</li>` : ''}
    ${editorCommand ? `<li>${editorCommand.markdownLink.value}</li>` : ''}
  </ul>
</li>
`;
      } else if (ref.target?.type === 'file') {
        const targetFile = state.main.fileMap[ref.target.filePath];
        if (!targetFile) {
          return;
        }
        markdown = `
<li>File
  <ul>
    <li>Name: <strong>${targetFile.name}</strong></li>
    <li>Path: ${targetFile.filePath}</li>
    ${editorCommand ? `<li>${editorCommand.markdownLink.value}</li>` : ''}
  </ul>
</li>
`;
      } else if (ref.target?.type === 'image') {
        const imageId = `${ref.name}:${ref.target?.tag}`;
        const targetImage = state.main.imageMap[imageId];
        if (!targetImage) {
          return;
        }
        markdown = `
<li>Image
  <ul>
    <li>Name: <strong>${targetImage.name}</strong></li>
    <li>Tag: ${targetImage.tag}</li>
    ${editorCommand ? `<li>${editorCommand.markdownLink.value}</li>` : ''}
  </ul>
</li>`;
      }

      if (!markdown) {
        return;
      }

      if (ref.type === ResourceRefType.Incoming) {
        incomingRefsMarkdownTableRows.push(markdown);
      } else {
        outgoingRefsMarkdownTableRows.push(markdown);
      }
    });

    const hoverContents: monaco.IMarkdownString[] = [];
    if (incomingRefsMarkdownTableRows.length) {
      hoverContents.push(
        createMarkdownString(
          `
<h3>Incoming Links</h3>
${incomingRefsMarkdownTableRows.join('\n')}
`,
          true
        )
      );
    }
    if (outgoingRefsMarkdownTableRows.length) {
      hoverContents.push(
        createMarkdownString(
          `
<h3>Outgoing Links</h3>
${outgoingRefsMarkdownTableRows.join('\n')}
`,
          true
        )
      );
    }
    addEditorHover({
      range,
      contents: hoverContents,
    });

    if (matchedRefs.length === 1 && getEditorType() !== 'cluster') {
      const ref = matchedRefs[0];
      addEditorLink({
        range,
        handler: () => onClickRefLink({resourceMeta, ref, dispatch}),
      });
    } else {
      addEditorLink({range, handler: () => {}});
    }
  });
});

const addEditorCommandForRef = (args: {resourceMeta: ResourceMeta; ref: ResourceRef; dispatch: AppDispatch}) => {
  if (getEditorType() === 'cluster') {
    return;
  }
  const {resourceMeta, ref, dispatch} = args;
  if (!ref.target) {
    return;
  }
  let command: EditorCommand | undefined;
  if (ref.target.type === 'resource' && ref.target.resourceId) {
    command = addEditorCommand(
      {
        type: 'go_to_resource',
        text: 'Open resource',
        altText: 'Open resource',
        handler: () => {
          if (getEditorType() === 'cluster') {
            return;
          }
          if (ref.target?.type === 'resource') {
            dispatch(
              selectResource({resourceIdentifier: {id: (ref.target as any).resourceId, storage: resourceMeta.storage}})
            );
            trackEvent('edit/select_hover_link', {type: 'resource'});
          }
        },
      },
      true
    );
  } else if (ref.target.type === 'file') {
    command = addEditorCommand(
      {
        type: 'go_to_file',
        text: `Open file`,
        altText: 'Open file',
        handler: () => {
          if (ref.target?.type === 'file') {
            dispatch(selectFile({filePath: ref.target.filePath}));
            trackEvent('edit/select_hover_link', {type: 'file'});
          }
        },
      },
      true
    );
  } else if (ref.target.type === 'image') {
    command = addEditorCommand(
      {
        type: 'go_to_image',
        text: `Open image`,
        altText: 'Open image',
        handler: () => {
          if (ref.target?.type === 'image') {
            dispatch(selectImage({imageId: `${ref.name}:${ref.target?.tag}`}));
            trackEvent('edit/select_hover_link', {type: 'image'});
          }
        },
      },
      true
    );
  }
  return command;
};

const onClickRefLink = (args: {resourceMeta: ResourceMeta; ref: ResourceRef; dispatch: AppDispatch}) => {
  if (getEditorType() === 'cluster') {
    return;
  }
  const {resourceMeta, ref, dispatch} = args;
  if (ref.target?.type === 'resource' && ref.target.resourceId) {
    // is the storage of the target resource the same as the current resource?
    dispatch(selectResource({resourceIdentifier: {id: ref.target.resourceId, storage: resourceMeta.storage}}));
    trackEvent('edit/select_hover_link', {type: 'resource'});
  } else if (ref.target?.type === 'file' && ref.target.filePath) {
    dispatch(selectFile({filePath: ref.target.filePath}));
    trackEvent('edit/select_hover_link', {type: 'file'});
  } else if (ref.target?.type === 'image') {
    dispatch(selectImage({imageId: `${ref.name}:${ref.target?.tag}`}));
    trackEvent('edit/select_hover_link', {type: 'image'});
  }
};
