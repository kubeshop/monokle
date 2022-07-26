import {RefPosition} from '@models/k8sresource';

/**
 * Corresponds to a found folder containing a Chart.yaml file
 */
interface HelmChart {
  id: string;
  filePath: string;
  name: string;
  valueFileIds: string[]; // ids of contained Helm value files
  templateIds: string[]; // ids of contained Helm templates
}

interface HelmChartMenuItem {
  id: string;
  name: string;
  subItems: {id: string; name: string}[];
}

interface HelmValueMatch {
  keyPath: string;
  value: any;
  linePosition: RefPosition;
}

/**
 * A file named *values.yaml found in a Helm chart folder
 */
interface HelmValuesFile {
  id: string;
  filePath: string;
  name: string;
  isSelected: boolean;
  /** the id of the containing helm chart */
  helmChartId: string;
  values: HelmValueMatch[];
}

interface RangeAndValue {
  range: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
  value: string;
}

interface HelmTemplate {
  id: string;
  filePath: string;
  name: string;
  values: RangeAndValue[];
  helmChartId: string;
}

export type {HelmChart, HelmChartMenuItem, HelmValuesFile, RangeAndValue, HelmValueMatch, HelmTemplate};
