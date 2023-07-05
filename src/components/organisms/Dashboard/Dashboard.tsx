import {useAppSelector} from '@redux/hooks';

import ClusterResources from './ClusterResources';
import HelmReleaseDetails from './HelmReleaseDetails';
import {ImageResources} from './ImageResources';

const Dashboard: React.FC = () => {
  const activeKey = useAppSelector(state => state.dashboard.ui.activeAccordion);
  return (
    <>
      {activeKey === 'cluster-resources' && <ClusterResources />}
      {activeKey === 'helm-releases' && <HelmReleaseDetails />}
      {activeKey === 'images' && <ImageResources />}
    </>
  );
};

export default Dashboard;
