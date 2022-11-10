import {Space} from 'antd';

import {CompareSide} from '@monokle-desktop/shared';

import {HelmChartSelect} from './HelmChartSelect';
import {HelmValuesOrConfigSelect} from './HelmValuesOrConfigSelect';

type Props = {
  side: CompareSide;
};

export const HelmSelect: React.FC<Props> = ({side}) => {
  return (
    <Space wrap>
      <HelmChartSelect side={side} />
      <HelmValuesOrConfigSelect side={side} />
    </Space>
  );
};
