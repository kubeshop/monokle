import {useAppSelector} from '@redux/hooks';

import {HelmReleaseProvider} from './HelmReleaseContext';
import NonSelectedHelmRelease from './NonSelectedHelmRelease';
import SelectedHelmRelease from './SelectedHelmReleaseDetails';

const HelmReleaseDetails = () => {
  const release = useAppSelector(state => state.dashboard.helm.selectedHelmRelease!);
  return <HelmReleaseProvider>{release ? <SelectedHelmRelease /> : <NonSelectedHelmRelease />}</HelmReleaseProvider>;
};

export default HelmReleaseDetails;
