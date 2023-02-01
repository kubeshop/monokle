import {TypedUseSelectorHook} from 'react-redux';

import {createSelector} from '@reduxjs/toolkit';

import {useAppSelector} from '@redux/hooks';

import {RuleLevel, ValidationResult, getFileId, getResourceId} from '@monokle/validation';
import {ValidationState} from '@shared/models/validation';

export const useValidationSelector: TypedUseSelectorHook<ValidationState> = selector =>
  useAppSelector(state => selector(state.validation));

/* * * * * * * * * * * * * * * * * *
 * All problems
 * * * * * * * * * * * * * * * * * */
export const problemsSelector = createSelector(
  [(state: ValidationState) => state.lastResponse, (_: ValidationState, level?: RuleLevel) => level],
  (response, level) => {
    const allProblems = response?.runs.flatMap(r => r.results) ?? [];
    return level ? allProblems.filter(problem => (problem.level ?? 'warning') === level) : allProblems;
  }
);

export const errorsSelector = (state: ValidationState) => problemsSelector(state, 'error');
export const warningsSelector = (state: ValidationState) => problemsSelector(state, 'warning');

/* * * * * * * * * * * * * * * * * *
 * Problems by resource
 * * * * * * * * * * * * * * * * * */
export const problemsByResourcesSelector = createSelector(
  [(state: ValidationState) => problemsSelector(state), (_: ValidationState, level?: RuleLevel) => level],
  (problems, level): Record<string, ValidationResult[] | undefined> => {
    const problemsByResources: Map<string, ValidationResult[]> = new Map();

    problems.forEach(problem => {
      if (level && (problem.level ?? 'warning') !== level) {
        return;
      }

      const resourceId = getResourceId(problem);

      if (resourceId === undefined) {
        return;
      }

      if (!problemsByResources.has(resourceId)) {
        problemsByResources.set(resourceId, []);
      }

      problemsByResources.get(resourceId)?.push(problem);
    });

    return Object.fromEntries(problemsByResources);
  }
);

export const errorsByResourcesSelector = (state: ValidationState) => problemsByResourcesSelector(state, 'error');
export const warningsByResourcesSelector = (state: ValidationState) => problemsByResourcesSelector(state, 'warning');

export const problemsByResourceSelector = createSelector(
  [
    (state: ValidationState, _resource?: string, level?: RuleLevel) => {
      return problemsByResourcesSelector(state, level);
    },
    (_state: ValidationState, resource?: string) => resource,
  ],
  (problems, resource): ValidationResult[] => (!resource ? [] : problems[resource] ?? [])
);

export const errorsByResourceSelector = (state: ValidationState, resource?: string) => {
  return problemsByResourceSelector(state, resource, 'error');
};
export const warningsByResourceSelector = (state: ValidationState, resource?: string) => {
  return problemsByResourceSelector(state, resource, 'warning');
};

/* * * * * * * * * * * * * * * * * *
 * Problems by file path
 * * * * * * * * * * * * * * * * * */
export const problemsByFilePathsSelector = createSelector(
  [(state: ValidationState) => problemsSelector(state), (_: ValidationState, level?: RuleLevel) => level],
  (problems, level): Record<string, ValidationResult[] | undefined> => {
    const problemsByFile: Map<string, ValidationResult[]> = new Map();

    problems.forEach(problem => {
      if (level && (problem.level ?? 'warning') !== level) {
        return;
      }

      const filePath = getFileId(problem);

      if (filePath === undefined) {
        return;
      }

      if (!problemsByFile.has(filePath)) {
        problemsByFile.set(filePath, []);
      }

      problemsByFile.get(filePath)?.push(problem);
    });

    return Object.fromEntries(problemsByFile);
  }
);

export const errorsByFilePathsSelector = (state: ValidationState) => problemsByFilePathsSelector(state, 'error');
export const warningsByFilePathsSelector = (state: ValidationState) => problemsByFilePathsSelector(state, 'warning');

export const problemsByFilePathSelector = createSelector(
  [
    (state: ValidationState, _path: string, level?: RuleLevel) => problemsByFilePathsSelector(state, level),
    (_state: ValidationState, path?: string) => path,
  ],
  (problems, path): ValidationResult[] => (!path ? [] : problems[path] ?? [])
);

export const errorsByFilePathSelector = (state: ValidationState, path: string) => {
  return problemsByFilePathSelector(state, path, 'error');
};

export const warningsByFilePathSelector = (state: ValidationState, path: string) => {
  return problemsByFilePathSelector(state, path, 'warning');
};

/* * * * * * * * * * * * * * * * * *
 * Miscellaneous
 * * * * * * * * * * * * * * * * * */

export const pluginMetadataSelector = createSelector(
  [(state: ValidationState) => state.metadata, (state: ValidationState, plugin?: string) => plugin],
  (metadata, plugin) => (!plugin ? undefined : metadata?.[plugin])
);

export const pluginRulesSelector = createSelector(
  [(state: ValidationState) => state.rules, (state: ValidationState, plugin?: string) => plugin],
  (rules, plugin) => (!plugin ? [] : rules?.[plugin] ?? [])
);

export const opaRuleCountSelector = (state: ValidationState) => {
  const pluginMetadata = pluginMetadataSelector(state, 'open-policy-agent');
  if (!pluginMetadata?.configuration.enabled) return 0;

  const rules = pluginRulesSelector(state, 'open-policy-agent');

  return rules.reduce((sum: number, rule) => {
    const value: number = rule.configuration.enabled ? 1 : 0;
    return sum + value;
  }, 0);
};
