import {useCallback} from 'react';

import {MinusSquareOutlined, PlusSquareOutlined} from '@ant-design/icons';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {collapsePreviewConfigurationsHelmChart, togglePreviewConfigurationsHelmChart} from '@redux/reducers/ui';

import {Colors} from '@shared/styles/colors';

type IProps = {
  id: string;
};

const HelmChartCollapse: React.FC<IProps> = props => {
  const {id} = props;

  const dispatch = useAppDispatch();
  const isSectionCollapsed = useAppSelector(state => state.ui.collapsedPreviewConfigurationsHelmCharts.includes(id));

  const onClickHandler = useCallback(
    (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
      e.stopPropagation();

      if (isSectionCollapsed) {
        dispatch(togglePreviewConfigurationsHelmChart(id));
      } else {
        dispatch(collapsePreviewConfigurationsHelmChart(id));
      }
    },
    [dispatch, id, isSectionCollapsed]
  );

  if (isSectionCollapsed) {
    return <PlusSquareOutlined style={{color: Colors.grey9, fontSize: '12px'}} onClick={onClickHandler} />;
  }

  return <MinusSquareOutlined style={{color: Colors.grey9, fontSize: '12px'}} onClick={onClickHandler} />;
};

export default HelmChartCollapse;
