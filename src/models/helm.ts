/**
 * Corresponds to a found folder containing a Chart.yaml file
 */
interface HelmChart {
  id: string;
  filePath: string;
  name: string;
  valueFileIds: string[]; // ids of contained Helm value files
  templateFilePaths: string[]; // other files contained in the helm chart
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
}

export type {HelmChart, HelmValuesFile};
