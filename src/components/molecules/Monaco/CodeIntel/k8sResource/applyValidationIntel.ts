import * as monaco from 'monaco-editor';

import store from '@redux/store';
import {problemsByResourceSelector} from '@redux/validation/validation.selectors';

import {RuleMetadata, ValidationResult, getResourceLocation, getRuleForResultV2} from '@monokle/validation';
import {K8sResource} from '@shared/models/k8sResource';

const applyValidationIntel = (
  resource: K8sResource
): {
  decorations: monaco.editor.IModelDeltaDecoration[];
  markers: monaco.editor.IMarkerData[];
  disposables: monaco.IDisposable[];
} => {
  // Hack where Redux store is accessed outside of React tree.
  const state = store.getState();

  const markers: monaco.editor.IMarkerData[] = [];

  const response = state.validation.lastResponse;
  const problems = problemsByResourceSelector(state.validation, resource.id);

  if (!response) {
    return {decorations: [], disposables: [], markers};
  }

  problems.forEach(problem => {
    const rule = getRuleForResultV2(response.runs[0], problem);
    const region = getResourceLocation(problem).physicalLocation?.region;

    if (!region) {
      return;
    }

    // Create marker
    const marker: monaco.editor.IMarkerData = {
      source: `(${problem.ruleId})`,
      message: getMessageText(problem, rule),
      startLineNumber: region.startLine,
      startColumn: region.startColumn,
      endLineNumber: region.endLine,
      endColumn: region.endColumn,
      severity: (problem.level ?? 'warning') === 'error' ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
    };
    markers.push(marker);
  });

  return {decorations: [], markers, disposables: []};
};

function getMessageText(error: ValidationResult, rule?: RuleMetadata): string {
  return !rule
    ? error.message.text
    : rule.fullDescription
    ? `${rule.shortDescription.text}\n  ${rule.fullDescription.text}\n    ${rule.help.text}`
    : `${rule.shortDescription.text}\n  ${rule.help.text}`;
}

export default applyValidationIntel;
