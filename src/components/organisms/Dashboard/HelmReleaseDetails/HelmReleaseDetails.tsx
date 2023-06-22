import {useAppSelector} from '@redux/hooks';

import NonSelectedHelmRelease from './NonSelectedHelmRelease';
import SelectedHelmRelease from './SelectedHelmReleaseDetails';

const HelmReleaseDetails = () => {
  const release = useAppSelector(state => state.dashboard.helm.selectedHelmRelease!);
  return release ? <SelectedHelmRelease /> : <NonSelectedHelmRelease />;
};

export default HelmReleaseDetails;
