import {useCallback} from 'react';

import {MinusSquareOutlined, PlusSquareOutlined} from '@ant-design/icons';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {collapseHelmChart, toggleHelmChart} from '@redux/reducers/ui';

import {Colors} from '@shared/styles/colors';

type IProps = {
  id: string;
  isSelected: boolean;
};

const HelmChartCollapse: React.FC<IProps> = props => {
  const {id, isSelected} = props;

  const dispatch = useAppDispatch();
  const isSectionCollapsed = useAppSelector(state => state.ui.collapsedHelmCharts.includes(id));

  const onClickHandler = useCallback(
    (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
      e.stopPropagation();

      if (isSectionCollapsed) {
        dispatch(toggleHelmChart(id));
      } else {
        dispatch(collapseHelmChart(id));
      }
    },
    [dispatch, id, isSectionCollapsed]
  );

  if (isSectionCollapsed) {
    return (
      <PlusSquareOutlined
        style={{color: isSelected ? Colors.blackPure : Colors.grey9, fontSize: '12px'}}
        onClick={onClickHandler}
      />
    );
  }

  return (
    <MinusSquareOutlined
      style={{color: isSelected ? Colors.blackPure : Colors.grey9, fontSize: '12px'}}
      onClick={onClickHandler}
    />
  );
};

export default HelmChartCollapse;
