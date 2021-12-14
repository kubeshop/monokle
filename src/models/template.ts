import {Array, Literal, Record, Static, String, Union} from 'runtypes';

const TemplateFormRuntype = Record({
  name: String,
  description: String,
  schema: String,
  uiSchema: String,
});

const TemplateManifestRuntype = Record({
  filePath: String,
  fileRenameRule: String,
});

const TemplateBaseRuntype = Record({
  id: String,
  forms: Array(TemplateFormRuntype),
});

const VanillaTemplateRuntype = TemplateBaseRuntype.extend({
  type: Literal('vanilla'),
  manifests: Array(TemplateManifestRuntype),
});

const BundledHelmChartTemplateRuntype = TemplateBaseRuntype.extend({
  type: Literal('helm-chart'),
  valuesFilePath: String,
});

const ReferencedHelmChartTemplateRuntype = TemplateBaseRuntype.extend({
  type: Literal('helm-chart'),
  valuesFilePath: String,
  chartName: String,
  chartVersion: String,
  chartRepo: String,
  helpUrl: String,
});

const HelmChartTemplateRuntype = Union(BundledHelmChartTemplateRuntype, ReferencedHelmChartTemplateRuntype);

const TemplateRuntype = Union(VanillaTemplateRuntype, HelmChartTemplateRuntype);

export const isTemplateForm = TemplateFormRuntype.check;
export const isTemplateManifest = TemplateManifestRuntype.check;
export const isVanillaTemplate = VanillaTemplateRuntype.check;
export const isBundledHelmChartTemplate = BundledHelmChartTemplateRuntype.check;
export const isReferencedHelmChartTemplate = ReferencedHelmChartTemplateRuntype.check;
export const isHelmChartTemplate = HelmChartTemplateRuntype.check;
export const isTemplate = TemplateRuntype.check;

export type TemplateForm = Static<typeof TemplateFormRuntype>;
export type TemplateManifest = Static<typeof TemplateManifestRuntype>;
export type VanillaTemplate = Static<typeof VanillaTemplateRuntype>;
export type BundledHelmChartTemplate = Static<typeof BundledHelmChartTemplateRuntype>;
export type ReferencedHelmChartTemplate = Static<typeof ReferencedHelmChartTemplateRuntype>;
export type HelmChartTemplate = Static<typeof HelmChartTemplateRuntype>;
export type Template = Static<typeof TemplateRuntype>;
