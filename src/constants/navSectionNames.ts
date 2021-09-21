const K8S_RESOURCES = 'K8s Resources';
const WORKLOADS = 'Workloads';
const CONFIGURATION = 'Configuration';
const NETWORK = 'Network';
const STORAGE = 'Storage';
const ACCESS_CONTROL = 'Access Control';
const CUSTOM = 'Custom';

/** stores the order of subsections for each section */
const representation: Record<string, string[]> = {
  [K8S_RESOURCES]: [WORKLOADS, CONFIGURATION, NETWORK, STORAGE, ACCESS_CONTROL, CUSTOM],
};

export default {
  representation,
  K8S_RESOURCES,
  WORKLOADS,
  CONFIGURATION,
  NETWORK,
  STORAGE,
  ACCESS_CONTROL,
  CUSTOM,
};
