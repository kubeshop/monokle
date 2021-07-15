import {monaco} from 'react-monaco-editor';
import {isUnsatisfiedRef, isOutgoingRef} from '@redux/utils/resourceRefs';
import {K8sResource, ResourceRef, RefPosition} from '@models/k8sresource';

import {ResourceMapType} from '@models/appstate';

import {GlyphDecorationTypes, InlineDecorationTypes} from './editorConstants';

import {
  createCommandMarkdownLink,
  createGlyphDecoration,
  createInlineDecoration,
  createHoverProvider,
  createMarkdownString,
  createLinkProvider,
} from './editorHelpers';

function areRefPosEqual(a: RefPosition, b: RefPosition) {
  return a.line === b.line && a.column === b.column && a.length === b.length;
}

export function applyForResource(
  resource: K8sResource,
  selectResource: (resourceId: string) => void,
  resourceMap: ResourceMapType
) {
  const refs = resource.refs;
  const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];
  const newHoverDisposables: monaco.IDisposable[] = [];
  const newCommandDisposables: monaco.IDisposable[] = [];
  const newLinkDisposables: monaco.IDisposable[] = [];

  if (!refs || refs.length === 0) {
    return {newDecorations, newHoverDisposables, newCommandDisposables, newLinkDisposables};
  }

  const unsatisfiedRefs = refs?.filter(r => isUnsatisfiedRef(r.refType));
  const listOfOutgoingRefsByEqualPos: {position: RefPosition; outgoingRefs: ResourceRef[]}[] = [];

  refs.forEach(ref => {
    const refPos = ref.refPos;
    if (refPos && isOutgoingRef(ref.refType)) {
      const refsByEqualPosIndex = listOfOutgoingRefsByEqualPos.findIndex(e => areRefPosEqual(e.position, refPos));
      if (refsByEqualPosIndex === -1) {
        listOfOutgoingRefsByEqualPos.push({
          position: refPos,
          outgoingRefs: [ref],
        });
      } else {
        listOfOutgoingRefsByEqualPos[refsByEqualPosIndex].outgoingRefs.push(ref);
      }
    }
  });

  unsatisfiedRefs.forEach(ref => {
    const refPos = ref.refPos;
    if (refPos) {
      const inlineRange = new monaco.Range(refPos.line, refPos.column, refPos.line, refPos.column + refPos.length);
      const glyphDecoration = createGlyphDecoration(refPos.line, GlyphDecorationTypes.UnsatisfiedRef);
      newDecorations.push(glyphDecoration);

      const inlineDecoration = createInlineDecoration(inlineRange, InlineDecorationTypes.UnsatisfiedRef);
      newDecorations.push(inlineDecoration);
    }
  });

  listOfOutgoingRefsByEqualPos.forEach(({outgoingRefs, position}) => {
    const inlineRange = new monaco.Range(
      position.line,
      position.column,
      position.line,
      position.column + position.length
    );

    const glyphDecoration = createGlyphDecoration(position.line, GlyphDecorationTypes.SatisfiedRef);
    newDecorations.push(glyphDecoration);

    const inlineDecoration = createInlineDecoration(inlineRange, InlineDecorationTypes.SatisfiedRef);
    newDecorations.push(inlineDecoration);

    const commandMarkdownLinkList: monaco.IMarkdownString[] = [];
    outgoingRefs.forEach(outgoingRef => {
      if (!outgoingRef.targetResource) {
        return;
      }
      const outgoingRefResource = resourceMap[outgoingRef.targetResource];
      if (!outgoingRefResource) {
        return;
      }
      const {commandMarkdownLink, commandDisposable} = createCommandMarkdownLink(outgoingRefResource.name, () => {
        if (outgoingRef.targetResource) {
          selectResource(outgoingRef.targetResource);
        }
      });
      commandMarkdownLinkList.push(commandMarkdownLink);
      newCommandDisposables.push(commandDisposable);
    });

    if (commandMarkdownLinkList.length > 0) {
      const hoverDisposable = createHoverProvider(inlineRange, [
        createMarkdownString('Outgoing Links'),
        ...commandMarkdownLinkList,
      ]);
      newHoverDisposables.push(hoverDisposable);
    }

    if (outgoingRefs.length === 1) {
      const outgoingRef = outgoingRefs[0];
      const linkDisposable = createLinkProvider(inlineRange, () => {
        if (outgoingRef.targetResource) {
          selectResource(outgoingRef.targetResource);
        }
      });
      newLinkDisposables.push(linkDisposable);
    }
  });

  return {newDecorations, newHoverDisposables, newCommandDisposables, newLinkDisposables};
}

export default {
  applyForResource,
};
