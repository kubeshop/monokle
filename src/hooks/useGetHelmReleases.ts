import {useAsync} from 'react-use';

import {useAppSelector} from '@redux/hooks';

import {HelmRelease} from '@shared/models/ui';
import {listHelmReleasesCommand, runCommandInMainThread} from '@shared/utils/commands';

const useGetHelmReleases = () => {
  const selectedNamespace = useAppSelector(state => state.main.clusterConnection?.namespace);
  const helmRepoSearch = useAppSelector(state => state.ui.helmPane.chartSearchToken);

  const {value: list = [], loading} = useAsync(async () => {
    const output = await runCommandInMainThread(
      listHelmReleasesCommand({filter: helmRepoSearch, namespace: selectedNamespace?.replace('<all>', '')})
    );
    if (output.stderr) {
      throw new Error(output.stderr);
    }
    return JSON.parse(output.stdout || '[]') as HelmRelease[];
  }, [helmRepoSearch, selectedNamespace]);
  return {list, loading};
};

export default useGetHelmReleases;
