interface HelmChart {
  filePath: string;
  name: string;
  selected: boolean;
  valueFiles: HelmValuesFile[];
}

interface HelmValuesFile {
  filePath: string;
  name: string;
  selected: boolean;
}

export type {HelmChart, HelmValuesFile};
