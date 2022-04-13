import * as Rt from 'runtypes';

import {loadPolicy} from '@open-policy-agent/opa-wasm';

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
  help: Rt.Record({
    text: Rt.String,
  }),
  helpUri: Rt.Optional(Rt.String),
  properties: Rt.Record({
    severity: Rt.String,
    entrypoint: Rt.String,
    path: Rt.String,
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

export type LoadedPolicy = {
  metadata: BasicPolicy;
  validator: PolicyValidator;
};
