import {flatten} from 'lodash';
import log from 'loglevel';

import {CLUSTER_DIFF_PREFIX, YAML_DOCUMENT_DELIMITER_NEW_LINE} from '@constants/constants';

import {K8sResource} from '@models/k8sresource';
import {RootState} from '@models/rootstate';

import {currentKubeContext} from '@redux/selectors';

import {createKubeClient} from '@utils/kubeclient';

import getClusterObjects from '../getClusterObjects';
import {extractK8sResources} from '../resource';

export async function fetchResourcesFromCluster(state: RootState): Promise<K8sResource[]> {
  try {
    const currentContext = currentKubeContext(state.config);
    const clusterAccess = state.config.projectConfig?.clusterAccess?.filter(ca => ca.context === currentContext) || [];
    const kc = createKubeClient(state.config);

    const res = clusterAccess.length
      ? await Promise.all(clusterAccess.map(ca => getClusterObjects(kc, ca.namespace)))
      : await getClusterObjects(kc);
    const results = flatten(res);
    const fulfilledResults = results.filter(r => r.status === 'fulfilled' && r.value);

    if (fulfilledResults.length === 0) {
      throw new Error('fetch failed');
    }

    const allYaml = fulfilledResults.map(r => (r as any).value).join(YAML_DOCUMENT_DELIMITER_NEW_LINE);
    return extractK8sResources(allYaml, CLUSTER_DIFF_PREFIX + String(kc.currentContext));
  } catch (err) {
    log.debug('fetch resources form cluster failed', err);
    throw err;
  }
}
