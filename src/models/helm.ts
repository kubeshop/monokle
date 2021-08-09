/**
 * Corresponds to a found folder containing a Chart.yaml file
 */

interface HelmChart {
  id: string;
  filePath: string;
  name: string;
  valueFiles: string[]; // ids of contained Helm value files
}

/**
 * A file named *values.yaml found in a Helm chart folder
 */

interface HelmValuesFile {
  id: string;
  filePath: string;
  name: string;
  selected: boolean;
  helmChart: string; // the id of the containing helm chart
}

export type {HelmChart, HelmValuesFile};
