import type {
  Config,
  PluginMetadataWithConfig,
  PluginName,
  RefPosition,
  RuleMetadataWithConfig,
  ValidationResponse,
  ValidationResult,
} from '@monokle/validation';

import {ResourceIdentifier, ResourceStorage} from './k8sResource';
import type {SarifRule} from './policy';

type Initialization = 'uninitialized' | 'loading' | 'error' | 'loaded';
export type NewProblemsIntroducedType = 'initial' | 'k8s-schema' | 'rule';

export type SelectedProblem = {
  problem: ValidationResult;
  selectedFrom: 'resource' | 'file';
};

export type ValidationState = {
  config: Config;
  status: Initialization;
  lastResponse?: ValidationResponse;
  loadRequestId?: string;
  /**
   * The plugin metadata and configuration for all plugins.
   */
  metadata?: Record<PluginName, PluginMetadataWithConfig>;

  /**
   * The rule metadata and configuration for all plugins.
   */
  rules?: Record<PluginName, RuleMetadataWithConfig[]>;
  validationOverview: {
    selectedProblem?: SelectedProblem;
    newProblemsIntroducedType: NewProblemsIntroducedType;
  };
};

export type ResourceValidationError = {
  property: string;
  message: string;
  errorPos?: RefPosition;
  description?: string;
  rule?: SarifRule;
};

export type ResourceValidation = {
  isValid: boolean;
  errors: ResourceValidationError[];
};

export type LoadValidationResult = {
  rules: Record<PluginName, RuleMetadataWithConfig[]>;
  metadata: Record<PluginName, PluginMetadataWithConfig>;
};

export type FullValidationArgs = {
  type: 'full';
  resourceStorage?: ResourceStorage;
};

export type IncrementalValidationArgs = {
  type: 'incremental';
  resourceIdentifiers: ResourceIdentifier[];
};

export type ValidationArgs = FullValidationArgs | IncrementalValidationArgs;

export type Severity = 'error' | 'warning' | 'recommendation';
export type Rule = {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  learnMoreUrl?: string;
  severity: 'low' | 'medium' | 'high';
  enabled: boolean;
  level: 'warning' | 'error';
  defaultLevel: 'warning' | 'error';
};
