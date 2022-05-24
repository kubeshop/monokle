import {monaco} from 'react-monaco-editor';

import {K8sResource} from '@models/k8sresource';

import {createGlyphDecoration, createMarkdownString, createMarker} from '@molecules/Monaco/editorHelpers';

import {isDefined} from '@utils/filter';

import {GlyphDecorationTypes} from '../../editorConstants';

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

export default applyPolicyIntel;
