import * as Rt from 'runtypes';

import {GitRepository} from './repository';

const ReferencedTemplatePluginModuleRuntype = Rt.Record({
  type: Rt.Literal('template'),
  url: Rt.String,
});

const BundledTemplatePluginModuleRuntype = Rt.Record({
  type: Rt.Literal('template'),
  path: Rt.String,
});

const TemplatePluginModuleRuntype = Rt.Union(BundledTemplatePluginModuleRuntype, ReferencedTemplatePluginModuleRuntype);

const MonoklePluginModuleRuntype = TemplatePluginModuleRuntype;

const PluginPackageJsonRuntype = Rt.Record({
  name: Rt.String,
  author: Rt.String,
  version: Rt.String,
  repository: Rt.String,
  description: Rt.Optional(Rt.String),
  monoklePlugin: Rt.Record({
    modules: Rt.Array(MonoklePluginModuleRuntype),
  }),
}).And(Rt.Dictionary(Rt.Unknown));

export type PluginPackageJson = Rt.Static<typeof PluginPackageJsonRuntype>;
export type ReferencedTemplatePluginModule = Rt.Static<typeof ReferencedTemplatePluginModuleRuntype>;
export type BundledTemplatePluginModule = Rt.Static<typeof BundledTemplatePluginModuleRuntype>;
export type TemplatePluginModule = Rt.Static<typeof TemplatePluginModuleRuntype>;
export type MonoklePluginModule = Rt.Static<typeof MonoklePluginModuleRuntype>;

export const isPluginPackageJson = PluginPackageJsonRuntype.guard;
export const isTemplatePluginModule = TemplatePluginModuleRuntype.guard;
export const isReferencedTemplatePluginModule = ReferencedTemplatePluginModuleRuntype.guard;
export const isBundledTemplatePluginModule = BundledTemplatePluginModuleRuntype.guard;
export const isMonoklePluginModule = MonoklePluginModuleRuntype.guard;

export interface MonoklePlugin {
  name: string;
  version: string;
  author: string;
  description?: string;
  repository: GitRepository;
  isActive: boolean;
  modules: MonoklePluginModule[];
}
