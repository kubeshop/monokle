interface HelmChart {
  id: string;
  filePath: string;
  name: string;
  selected: boolean;
  valueFiles: string[];
}

interface HelmValuesFile {
  id: string;
  filePath: string;
  name: string;
  selected: boolean;
  helmChart: string;
}

export type {HelmChart, HelmValuesFile};
