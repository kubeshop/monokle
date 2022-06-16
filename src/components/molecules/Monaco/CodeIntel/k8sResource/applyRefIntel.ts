import {monaco} from 'react-monaco-editor';

import {FileMapType, ResourceMapType} from '@models/appstate';
import {K8sResource, RefPosition, ResourceRef, ResourceRefType} from '@models/k8sresource';

import {getResourceFolder} from '@redux/services/fileEntry';
import {areRefPosEqual, isPreviewResource, isUnsavedResource} from '@redux/services/resource';
import {isUnsatisfiedRef} from '@redux/services/resourceRefs';

import {GlyphDecorationTypes, InlineDecorationTypes} from '@molecules/Monaco/editorConstants';
import {
  createCommandMarkdownLink,
  createGlyphDecoration,
  createHoverProvider,
  createInlineDecoration,
  createLinkProvider,
  createMarkdownString,
} from '@molecules/Monaco/editorHelpers';

function applyRefIntel(
  resource: K8sResource,
  selectResource: (resourceId: string) => void,
  selectFilePath: (filePath: string) => void,
  createResource: ((outgoingRef: ResourceRef, namespace?: string, targetFolderget?: string) => void) | undefined,
  selectImage: (imageId: string) => void,
  resourceMap: ResourceMapType,
  fileMap: FileMapType
): {
  decorations: monaco.editor.IModelDeltaDecoration[];
  disposables: monaco.IDisposable[];
} {
  const refs = resource.refs ?? [];
  const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];
  const newDisposables: monaco.IDisposable[] = [];

  if (refs.length === 0) {
    return {decorations: newDecorations, disposables: newDisposables};
  }

  const listOfMatchedRefsByEqualPos: {
    refType: ResourceRefType;
    position: RefPosition;
    matchedRefs: ResourceRef[];
    targetType: string;
  }[] = [];

  // find refs that can be decorated
  refs.forEach(ref => {
    const refPos = ref.position;

    if (refPos) {
      const refsByEqualPosIndex = listOfMatchedRefsByEqualPos.findIndex(e => areRefPosEqual(e.position, refPos));
      if (refsByEqualPosIndex === -1) {
        listOfMatchedRefsByEqualPos.push({
          refType: ref.type,
          position: refPos,
          matchedRefs: [ref],
          targetType: ref.target?.type || '',
        });
      } else {
        listOfMatchedRefsByEqualPos[refsByEqualPosIndex].matchedRefs.push(ref);
      }
    }
  });

  // decorate matched refs
  listOfMatchedRefsByEqualPos.forEach(({matchedRefs, position, refType, targetType}) => {
    const inlineRange = new monaco.Range(
      position.line,
      position.column,
      position.line,
      position.column + position.length
    );

    const commandMarkdownLinkList: monaco.IMarkdownString[] = [];
    matchedRefs.forEach(matchRef => {
      if (!matchRef.target) {
        return;
      }

      // add command for creating resource from unsatisfied ref
      if (createResource && isUnsatisfiedRef(matchRef.type)) {
        if (matchRef.target.type === 'resource' && !matchRef.target.resourceId && matchRef.target.resourceKind) {
          const {commandMarkdownLink, commandDisposable} = createCommandMarkdownLink(
            `Create ${matchRef.target.resourceKind}`,
            'Create Resource',
            () => {
              createResource(matchRef, resource.namespace, getResourceFolder(resource));
            }
          );
          commandMarkdownLinkList.push(commandMarkdownLink);
          newDisposables.push(commandDisposable);
        }
      }
      // add command for navigating to resource
      else if (matchRef.target.type === 'resource' && matchRef.target.resourceId) {
        const outgoingRefResource = resourceMap[matchRef.target.resourceId];
        if (!outgoingRefResource) {
          return;
        }

        let text = `${outgoingRefResource.kind}: ${outgoingRefResource.name}`;
        if (!isPreviewResource(outgoingRefResource) && !isUnsavedResource(outgoingRefResource)) {
          text += ` in ${outgoingRefResource.filePath}`;
        }

        const {commandMarkdownLink, commandDisposable} = createCommandMarkdownLink(text, 'Select resource', () => {
          // @ts-ignore
          selectResource(matchRef.target?.resourceId);
        });
        commandMarkdownLinkList.push(commandMarkdownLink);
        newDisposables.push(commandDisposable);
      }
      // add command for navigating to file
      else if (matchRef.target.type === 'file') {
        const outgoingRefFile = fileMap[matchRef.target.filePath];
        if (!outgoingRefFile) {
          return;
        }
        const {commandMarkdownLink, commandDisposable} = createCommandMarkdownLink(
          `${outgoingRefFile.name}`,
          'Select file',
          () => {
            // @ts-ignore
            selectFilePath(matchRef.target?.filePath);
          }
        );
        commandMarkdownLinkList.push(commandMarkdownLink);
        newDisposables.push(commandDisposable);
      }
    });

    const hoverTitle =
      refType === ResourceRefType.Outgoing
        ? targetType === 'image'
          ? 'Outgoing Image Link'
          : 'Outgoing Links'
        : refType === ResourceRefType.Incoming
        ? 'Incoming Links'
        : 'Unsatisfied link';

    const hoverCommandMarkdownLinkList = [createMarkdownString(hoverTitle), ...commandMarkdownLinkList];

    // aggregate commands into markdown
    if (hoverCommandMarkdownLinkList.length > 1) {
      const hoverDisposable = createHoverProvider(inlineRange, hoverCommandMarkdownLinkList);
      newDisposables.push(hoverDisposable);
    }

    // unsatisfied refs take precedence for decorations
    const hasUnsatisfiedRef = matchedRefs.some(ref => isUnsatisfiedRef(ref.type));

    const inlineDecoration = createInlineDecoration(
      inlineRange,
      hasUnsatisfiedRef ? InlineDecorationTypes.UnsatisfiedRef : InlineDecorationTypes.SatisfiedRef
    );
    newDecorations.push(inlineDecoration);

    const glyphDecoration = createGlyphDecoration(
      position.line,
      hasUnsatisfiedRef
        ? GlyphDecorationTypes.UnsatisfiedRef
        : refType === ResourceRefType.Outgoing
        ? targetType === 'image'
          ? GlyphDecorationTypes.OutgoingImageRef
          : GlyphDecorationTypes.OutgoingRef
        : GlyphDecorationTypes.IncomingRef,
      hoverCommandMarkdownLinkList
    );
    newDecorations.push(glyphDecoration);

    // create default link if there is only one command
    if (matchedRefs.length === 1) {
      const matchRef = matchedRefs[0];
      if (createResource || !isUnsatisfiedRef(matchRef.type)) {
        const linkDisposable = createLinkProvider(
          inlineRange,
          isUnsatisfiedRef(matchRef.type)
            ? 'Create resource'
            : matchRef.target?.type === 'image'
            ? 'Select image'
            : 'Open resource',
          () => {
            if (isUnsatisfiedRef(matchRef.type) && createResource) {
              createResource(matchRef, resource.namespace, getResourceFolder(resource));
            } else if (matchRef.target?.type === 'resource' && matchRef.target.resourceId) {
              selectResource(matchRef.target.resourceId);
            } else if (matchRef.target?.type === 'file' && matchRef.target.filePath) {
              selectFilePath(matchRef.target.filePath);
            } else if (matchRef.target?.type === 'image') {
              selectImage(`${matchRef.name}:${matchRef.target?.tag}`);
            }
          }
        );
        newDisposables.push(linkDisposable);
      }
    }
  });

  return {decorations: newDecorations, disposables: newDisposables};
}

export default applyRefIntel;
