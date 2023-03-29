import {RefPosition} from '@monokle/validation';

/**
 * Corresponds to a found folder containing a Chart.yaml file
 */
type HelmChart = {
  id: string;
  filePath: string;
  name: string;
  valueFileIds: string[]; // ids of contained Helm value files
  templateIds: string[]; // ids of contained Helm templates
};

type HelmChartMenuItem = {
  id: string;
  name: string;
  subItems: {id: string; name: string}[];
};

type HelmValueMatch = {
  keyPath: string;
  value: any;
  linePosition: RefPosition;
};

/**
 * A file named *values.yaml found in a Helm chart folder
 */
type HelmValuesFile = {
  id: string;
  filePath: string;
  name: string;
  /** the id of the containing helm chart */
  helmChartId: string;
  values: HelmValueMatch[];
};

type RangeAndValue = {
  range: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
  value: string;
};

type HelmTemplate = {
  id: string;
  filePath: string;
  name: string;
  values: RangeAndValue[];
  helmChartId: string;
};

type HelmChartNode = {
  type: 'helm-chart';
  id: string;
};

type HelmValueNode = {
  type: 'helm-value';
  id: string;
};

type HelmListNode = HelmChartNode | HelmValueNode;

export type {
  HelmChart,
  HelmChartMenuItem,
  HelmChartNode,
  HelmListNode,
  HelmTemplate,
  HelmValuesFile,
  HelmValueMatch,
  HelmValueNode,
  RangeAndValue,
};
