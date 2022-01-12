import * as Rt from 'runtypes';

import {GitRepository} from './repository';

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
    modules: Rt.Array(AnyPluginModuleRuntype),
  }),
}).And(Rt.Dictionary(Rt.Unknown));

export type PluginPackageJson = Rt.Static<typeof PluginPackageJsonRuntype>;
export type BundledTemplatePluginModule = Rt.Static<typeof BundledTemplatePluginModuleRuntype>;
export type TemplatePluginModule = Rt.Static<typeof TemplatePluginModuleRuntype>;
export type AnyPluginModule = Rt.Static<typeof AnyPluginModuleRuntype>;

export const isPluginPackageJson = PluginPackageJsonRuntype.guard;
export const isTemplatePluginModule = TemplatePluginModuleRuntype.guard;
export const isBundledTemplatePluginModule = BundledTemplatePluginModuleRuntype.guard;
export const isAnyPluginModule = AnyPluginModuleRuntype.guard;

export const validatePluginPackageJson = PluginPackageJsonRuntype.check;
export const validateTemplatePluginModule = TemplatePluginModuleRuntype.check;
export const validateBundledTemplatePluginModule = BundledTemplatePluginModuleRuntype.check;
export const validateAnyPluginModule = AnyPluginModuleRuntype.check;

export interface AnyPlugin {
  name: string;
  version: string;
  author: string;
  description?: string;
  repository: GitRepository;
  isActive: boolean;
  modules: AnyPluginModule[];
}
