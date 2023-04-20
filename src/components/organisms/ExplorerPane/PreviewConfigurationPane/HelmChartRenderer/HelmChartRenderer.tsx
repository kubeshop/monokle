import {Tooltip} from 'antd';

import {dirname} from 'path';

import {TOOLTIP_DELAY} from '@constants/constants';

import {useAppSelector} from '@redux/hooks';

import {Icon} from '@monokle/components';
import {Colors} from '@shared/styles/colors';

import HelmChartCollapse from './HelmChartCollapse';
import * as S from './HelmChartRenderer.styled';

type IProps = {
  id: string;
};

const HelmChartRenderer: React.FC<IProps> = props => {
  const {id} = props;

  const helmChart = useAppSelector(state => state.main.helmChartMap[id]);

  return (
    <S.ItemContainer>
      <S.PrefixContainer>
        <HelmChartCollapse id={id} />
        <Icon name="helm" style={{color: Colors.grey9, fontSize: '16px'}} />
      </S.PrefixContainer>

      <S.ItemName>{helmChart.name}</S.ItemName>

      <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={helmChart.filePath}>
        <S.SuffixContainer>{dirname(helmChart.filePath)}</S.SuffixContainer>
      </Tooltip>
    </S.ItemContainer>
  );
};

export default HelmChartRenderer;
