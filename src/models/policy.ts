import * as Rt from 'runtypes';

import {loadPolicy} from '@open-policy-agent/opa-wasm';

//* * * * * * * * * * * * * * * * * * * * * * * *
// Globals
//* * * * * * * * * * * * * * * * * * * * * * * *
export type ValidatorId = string;
export const POLICY_VALIDATOR_MAP: Record<ValidatorId, PolicyValidator> = {};

//* * * * * * * * * * * * * * * * * * * * * * * *
// Plugin model
//* * * * * * * * * * * * * * * * * * * * * * * *
export type PolicyBase = Rt.Static<typeof PolicyBaseRuntype>;
export const PolicyBaseRuntype = Rt.Record({
  name: Rt.String,
  id: Rt.String,
  author: Rt.String,
  version: Rt.String,
  description: Rt.String,
  repository: Rt.Optional(Rt.String),
  icon: Rt.Optional(Rt.String),
  tags: Rt.Optional(Rt.Array(Rt.String)),
  helpUrl: Rt.Optional(Rt.String),
});

export type SarifRule = Rt.Static<typeof SarifRuleRuntype>;
export const SarifRuleRuntype = Rt.Record({
  id: Rt.String,
  shortDescription: Rt.Record({
    text: Rt.String,
  }),
  longDescription: Rt.Record({
    text: Rt.String,
  }),
  help: Rt.Record({
    text: Rt.String,
  }),
  helpUri: Rt.Optional(Rt.String),
  properties: Rt.Record({
    severity: Rt.String,
    entrypoint: Rt.String,
    path: Rt.Optional(Rt.String),
  }),
});

export type BasicPolicy = Rt.Static<typeof BasicPolicyRuntype>;
export const BasicPolicyRuntype = PolicyBaseRuntype.extend({
  type: Rt.Literal('basic'),
  module: Rt.String,
  rules: Rt.Array(SarifRuleRuntype),
});

//* * * * * * * * * * * * * * * * * * * * * * * *
// Internal model
//* * * * * * * * * * * * * * * * * * * * * * * *
export type PolicyValidator = Awaited<ReturnType<typeof loadPolicy>>;

/**
 * The configuration of the policy plugin.
 *
 * @remarks
 * This configuration is persisted in the electron store.
 * You can find it under `pluginConfig.policies`.
 */
export type PolicyConfig = {
  // The identifier of the policy.
  id: string;
  // Whether the policy is enabled.
  enabled: boolean;
  // List of rule identifiers that are enabled.
  enabledRules: string[];
};

export type Policy = {
  // The identifier of the validator, or `undefined` when not loaded.
  // You can retrieve the validator as follows: `POLICY_VALIDATOR_MAP["validatorId"]`.
  validatorId: ValidatorId | undefined;
  // The metadata of the policy.
  metadata: BasicPolicy;
  // The configuration of the policy.
  config: PolicyConfig;
};
