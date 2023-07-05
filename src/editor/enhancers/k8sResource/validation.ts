import * as monaco from 'monaco-editor';

import {problemsByResourceSelector} from '@redux/validation/validation.selectors';

import {RuleMetadata, ValidationResult, getResourceLocation, getRuleForResultV2} from '@monokle/validation';

import {createEditorEnhancer} from '../createEnhancer';

export const applyEditorValidation = createEditorEnhancer(props => {
  const {state, editor, resourceIdentifier} = props;

  const markers: monaco.editor.IMarkerData[] = [];

  const response = state.validation.lastResponse;
  const problems = problemsByResourceSelector(state.validation, resourceIdentifier?.id);

  if (!response) {
    return;
  }

  problems.forEach(problem => {
    const rule = getRuleForResultV2(response.runs[0], problem);
    const region = getResourceLocation(problem).physicalLocation?.region;

    if (!region) {
      return;
    }

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

  const model = editor.getModel();
  if (model) {
    monaco.editor.setModelMarkers(model, model.id, markers);
  }
});

function getMessageText(error: ValidationResult, rule?: RuleMetadata): string {
  return !rule
    ? error.message.text
    : rule.fullDescription
    ? `${rule.shortDescription.text}\n  ${rule.fullDescription.text}\n    ${rule.help.text}`
    : `${rule.shortDescription.text}\n  ${rule.help.text}`;
}
