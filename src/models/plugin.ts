import * as Rt from 'runtypes';

import {GitRepositoryRuntype} from './repository';

const BundledTemplatePluginModuleRuntype = Rt.Record({
  type: Rt.Literal('template'),
  path: Rt.String,
});

const TemplatePluginModuleRuntype = Rt.Union(BundledTemplatePluginModuleRuntype);

const AnyPluginModuleRuntype = TemplatePluginModuleRuntype;

const PluginPackageJsonRuntype = Rt.Record({
  name: Rt.String,
  author: Rt.String,
  version: Rt.String,
  repository: Rt.String,
  description: Rt.Optional(Rt.String),
  monoklePlugin: Rt.Record({
    id: Rt.String,
    modules: Rt.Array(AnyPluginModuleRuntype),
    helpUrl: Rt.Optional(Rt.String),
  }),
}).And(Rt.Dictionary(Rt.Unknown));

const AnyPluginRuntype = Rt.Record({
  id: Rt.String,
  name: Rt.String,
  author: Rt.String,
  version: Rt.String,
  repository: GitRepositoryRuntype,
  description: Rt.Optional(Rt.String),
  isActive: Rt.Boolean,
  modules: Rt.Array(AnyPluginModuleRuntype),
  helpUrl: Rt.Optional(Rt.String),
});

export type PluginPackageJson = Rt.Static<typeof PluginPackageJsonRuntype>;
export type BundledTemplatePluginModule = Rt.Static<typeof BundledTemplatePluginModuleRuntype>;
export type TemplatePluginModule = Rt.Static<typeof TemplatePluginModuleRuntype>;
export type AnyPluginModule = Rt.Static<typeof AnyPluginModuleRuntype>;
export type AnyPlugin = Rt.Static<typeof AnyPluginRuntype>;

export const isPluginPackageJson = PluginPackageJsonRuntype.guard;
export const isTemplatePluginModule = TemplatePluginModuleRuntype.guard;
export const isBundledTemplatePluginModule = BundledTemplatePluginModuleRuntype.guard;
export const isAnyPluginModule = AnyPluginModuleRuntype.guard;
export const isAnyPlugin = AnyPluginRuntype.guard;

export const validatePluginPackageJson = PluginPackageJsonRuntype.check;
export const validateTemplatePluginModule = TemplatePluginModuleRuntype.check;
export const validateBundledTemplatePluginModule = BundledTemplatePluginModuleRuntype.check;
export const validateAnyPluginModule = AnyPluginModuleRuntype.check;
export const validateAnyPlugin = AnyPluginRuntype.check;
