import {useAppSelector} from '@redux/hooks';

import NonSelectedHelmRelease from './NonSelectedHelmRelease';
import SelectedHelmRelease from './SelectedHelmReleaseDetails';

const HelmReleaseDetails = () => {
  const release = useAppSelector(state => state.ui.helmPane.selectedHelmRelease!);
  return release ? <SelectedHelmRelease /> : <NonSelectedHelmRelease />;
};

export default HelmReleaseDetails;
