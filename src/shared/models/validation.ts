import type {ValidationFiltersValueType} from '@monokle/components';
import type {
  Config,
  PluginMetadataWithConfig,
  PluginName,
  RuleMetadataWithConfig,
  ValidationResponse,
  ValidationResult,
} from '@monokle/validation';

import {K8sResource, ResourceIdentifier, ResourceStorage} from './k8sResource';
import {ValidationPlugin} from './validationPlugins';

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
    filters: ValidationFiltersValueType;
    selectedProblem?: SelectedProblem;
    newProblemsIntroducedType: NewProblemsIntroducedType;
  };
  configure: {
    plugin: ValidationPlugin | PluginMetadataWithConfig | undefined;
  };
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

export type ValidationResource = K8sResource & {filePath: string; fileOffset: number; fileId: string; content: any};
