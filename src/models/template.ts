import * as Rt from 'runtypes';

const TemplateFormRuntype = Rt.Record({
  name: Rt.String,
  description: Rt.String,
  schema: Rt.String,
  uiSchema: Rt.String,
});

const TemplateManifestRuntype = Rt.Record({
  filePath: Rt.String,
  fileRenameRule: Rt.String,
});

const TemplateBaseRuntype = Rt.Record({
  name: Rt.String,
  id: Rt.String,
  author: Rt.String,
  version: Rt.String,
  description: Rt.Optional(Rt.String),
  icon: Rt.Optional(Rt.String),
  tags: Rt.Optional(Rt.Array(Rt.String)),
  helpUrl: Rt.Optional(Rt.String),
});

const VanillaTemplateRuntype = TemplateBaseRuntype.extend({
  type: Rt.Literal('vanilla'),
  forms: Rt.Array(TemplateFormRuntype),
  manifests: Rt.Array(TemplateManifestRuntype),
});

const BundledHelmChartTemplateRuntype = TemplateBaseRuntype.extend({
  type: Rt.Literal('helm-chart'),
  forms: Rt.Array(TemplateFormRuntype),
  valuesFilePath: Rt.String,
  chartPath: Rt.String,
});

const ReferencedHelmChartTemplateRuntype = TemplateBaseRuntype.extend({
  type: Rt.Literal('helm-chart'),
  forms: Rt.Array(TemplateFormRuntype),
  valuesFilePath: Rt.String,
  chartName: Rt.String,
  chartVersion: Rt.String,
  chartRepo: Rt.String,
  helpUrl: Rt.String,
});

const HelmChartTemplateRuntype = Rt.Union(BundledHelmChartTemplateRuntype, ReferencedHelmChartTemplateRuntype);

const TemplateRuntype = Rt.Union(VanillaTemplateRuntype, HelmChartTemplateRuntype);

const TemplateRepositoryRuntype = Rt.Record({
  name: Rt.String,
  templates: Rt.Array(
    TemplateBaseRuntype.extend({
      path: Rt.String,
    })
  ),
});

export const isTemplateForm = TemplateFormRuntype.guard;
export const isTemplateManifest = TemplateManifestRuntype.guard;
export const isVanillaTemplate = VanillaTemplateRuntype.guard;
export const isBundledHelmChartTemplate = BundledHelmChartTemplateRuntype.guard;
export const isReferencedHelmChartTemplate = ReferencedHelmChartTemplateRuntype.guard;
export const isHelmChartTemplate = HelmChartTemplateRuntype.guard;
export const isTemplate = TemplateRuntype.guard;
export const isTemplateRepository = TemplateRepositoryRuntype.guard;

export type TemplateForm = Rt.Static<typeof TemplateFormRuntype>;
export type TemplateManifest = Rt.Static<typeof TemplateManifestRuntype>;
export type VanillaTemplate = Rt.Static<typeof VanillaTemplateRuntype>;
export type BundledHelmChartTemplate = Rt.Static<typeof BundledHelmChartTemplateRuntype>;
export type ReferencedHelmChartTemplate = Rt.Static<typeof ReferencedHelmChartTemplateRuntype>;
export type HelmChartTemplate = Rt.Static<typeof HelmChartTemplateRuntype>;
export type Template = Rt.Static<typeof TemplateRuntype>;
export type TemplateRepository = Rt.Static<typeof TemplateRepositoryRuntype>;
