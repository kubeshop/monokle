import {useAppSelector} from '@redux/hooks';

import ClusterResources from './ClusterResources';
import HelmReleaseDetails from './HelmReleaseDetails';

const Dashboard: React.FC = () => {
  const activeKey = useAppSelector(state => state.dashboard.ui.activeAccordion);
  return (
    <>
      {activeKey === 'cluster-resources' && <ClusterResources />}
      {activeKey === 'helm-releases' && <HelmReleaseDetails />}
    </>
  );
};

export default Dashboard;
