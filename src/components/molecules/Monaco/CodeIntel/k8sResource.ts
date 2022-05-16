import {monaco} from 'react-monaco-editor';

import {FileMapType, ResourceMapType} from '@models/appstate';
import {K8sResource, RefPosition, ResourceRef, ResourceRefType} from '@models/k8sresource';

import {getResourceFolder} from '@redux/services/fileEntry';
import {isPreviewResource, isUnsavedResource} from '@redux/services/resource';
import {isUnsatisfiedRef} from '@redux/services/resourceRefs';

import {CodeIntelApply} from '@molecules/Monaco/CodeIntel/types';
import {GlyphDecorationTypes, InlineDecorationTypes} from '@molecules/Monaco/editorConstants';
import {
  createCommandMarkdownLink,
  createGlyphDecoration,
  createHoverProvider,
  createInlineDecoration,
  createLinkProvider,
  createMarkdownString,
  createMarker,
} from '@molecules/Monaco/editorHelpers';
import {processSymbols} from '@molecules/Monaco/symbolProcessing';

import {isDefined} from '@utils/filter';

function areRefPosEqual(a: RefPosition, b: RefPosition) {
  return a.line === b.line && a.column === b.column && a.length === b.length;
}

function applyRefIntel(
  resource: K8sResource,
  selectResource: (resourceId: string) => void,
  selectFilePath: (filePath: string) => void,
  createResource: ((outgoingRef: ResourceRef, namespace?: string, targetFolderget?: string) => void) | undefined,
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

  const listOfMatchedRefsByEqualPos: {refType: ResourceRefType; position: RefPosition; matchedRefs: ResourceRef[]}[] =
    [];

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
        });
      } else {
        listOfMatchedRefsByEqualPos[refsByEqualPosIndex].matchedRefs.push(ref);
      }
    }
  });

  // decorate matched refs
  listOfMatchedRefsByEqualPos.forEach(({matchedRefs, position, refType}) => {
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
        ? 'Outgoing Links'
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
        ? GlyphDecorationTypes.OutgoingRef
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
          isUnsatisfiedRef(matchRef.type) ? 'Create resource' : 'Open resource',
          () => {
            if (isUnsatisfiedRef(matchRef.type) && createResource) {
              createResource(matchRef, resource.namespace, getResourceFolder(resource));
            } else if (matchRef.target?.type === 'resource' && matchRef.target.resourceId) {
              selectResource(matchRef.target.resourceId);
            } else if (matchRef.target?.type === 'file' && matchRef.target.filePath) {
              selectFilePath(matchRef.target.filePath);
            }
          }
        );
        newDisposables.push(linkDisposable);
      }
    }
  });

  return {decorations: newDecorations, disposables: newDisposables};
}

function applyPolicyIntel(resource: K8sResource): {
  decorations: monaco.editor.IModelDeltaDecoration[];
  markers: monaco.editor.IMarkerData[];
} {
  const issues = resource.issues?.errors ?? [];

  const glyphs = issues.map(issue => {
    const rule = issue.rule!;
    const message = [createMarkdownString(`${rule.shortDescription.text} __(${issue.message})__`)].filter(isDefined);

    return createGlyphDecoration(issue.errorPos?.line ?? 1, GlyphDecorationTypes.PolicyIssue, message);
  });

  const markers = issues
    .map(issue => {
      if (
        !issue.rule ||
        !issue.errorPos ||
        issue.errorPos.line === 1 ||
        issue.errorPos.endLine === undefined ||
        issue.errorPos.endColumn === undefined
      ) {
        return undefined;
      }

      const range = new monaco.Range(
        issue.errorPos.line,
        issue.errorPos.column,
        issue.errorPos.endLine,
        issue.errorPos.endColumn
      );

      const message = `${issue.rule.shortDescription.text}\n  ${issue.rule.longDescription.text}\n    ${issue.rule.help.text}`;

      return createMarker(issue.rule.id, message, range);
    })
    .filter(isDefined);

  return {decorations: glyphs, markers};
}

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

    const refIntel = applyRefIntel(resource, selectResource, selectFilePath, createResource, resourceMap, fileMap);
    disposables.push(...refIntel.disposables);
    decorations.push(...refIntel.decorations);

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
