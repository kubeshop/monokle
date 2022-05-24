import {RefPosition} from '@models/k8sresource';

/**
 * Corresponds to a found folder containing a Chart.yaml file
 */
interface HelmChart {
  id: string;
  filePath: string;
  name: string;
  valueFileIds: string[]; // ids of contained Helm value files
  templateFilePaths: HelmChartFile[]; // other files contained in the helm chart
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

interface HelmChartFile {
  id: string;
  filePath: string;
  values: RangeAndValue[];
}

export type {HelmChart, HelmValuesFile, RangeAndValue, HelmValueMatch};
