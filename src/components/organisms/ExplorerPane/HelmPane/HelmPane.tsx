import {memo, useMemo} from 'react';

import {CollapsePanelProps, Input, Typography} from 'antd';

import {size} from 'lodash';
import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {searchHelmRepo, setHelmRepoPane, setHideNavigatorPane} from '@redux/reducers/ui';

import {Icon, TitleBar, TitleBarCount} from '@monokle/components';
import {InjectedPanelProps} from '@shared/models/explorer';
import {Colors} from '@shared/styles';
import {isInClusterModeSelector} from '@shared/utils';

import AccordionPanel from '../AccordionPanel';
import HelmList from './HelmList';

const HelmPane: React.FC<InjectedPanelProps> = props => {
  const dispatch = useAppDispatch();
  const {isActive, panelKey} = props;

  const helmChartMap = useAppSelector(state => state.main.helmChartMap);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);

  const count = useMemo(
    () => size(Object.values(helmChartMap).filter(chart => !chart.name.includes('Unnamed Chart:'))),
    [helmChartMap]
  );

  const onHelmRepoSearchChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(searchHelmRepo(e.target.value));
  };

  const onHelmRepoSearchFocusHandler = () => {
    dispatch(setHelmRepoPane(true));
    dispatch(setHideNavigatorPane(true));
  };
  const onHelmRepoSearchBlurHandler = () => {
    // dispatch(setHelmRepoPane(false));
    //  dispatch(setHideNavigatorPane(false));
  };

  return (
    <AccordionPanel
      {...props}
      collapsible={isInClusterMode ? 'disabled' : undefined}
      header={
        <TitleBar
          title="Helm Charts"
          expandable
          isOpen={Boolean(isActive)}
          actions={<TitleBarCount count={count} isActive={Boolean(isActive)} />}
        />
      }
      showArrow={false}
      key={panelKey as CollapsePanelProps['key']}
    >
      <Content>
        <HelmExplorer>
          <HelmExplorerTitle>Browse Helm Charts</HelmExplorerTitle>
          <HelmExplorerInput
            prefix={<Icon name="globe-search" />}
            placeholder="Search Charts to download"
            onChange={onHelmRepoSearchChangeHandler}
            onFocus={onHelmRepoSearchFocusHandler}
            onBlur={onHelmRepoSearchBlurHandler}
          />
        </HelmExplorer>
      </Content>
      <HelmList />
    </AccordionPanel>
  );
};

export default memo(HelmPane);

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 100px 1fr;
  height: 100%;
  row-gap: 8px;
`;

const HelmExplorer = styled.div`
  position: sticky;
  top: 0;
  height: 100px;
  background-color: rgba(82, 115, 224, 0.3);
  margin: 0px 24px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
  padding-left: 16px;
  padding-right: 14px;
  z-index: 10;
`;

const HelmExplorerTitle = styled(Typography.Text)`
  font-size: 14px;
  line-height: 22px;
  font-weight: 600;
  color: ${Colors.grey9};
`;

const HelmExplorerInput = styled(Input)`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  width: unset !important;
  border: none !important;
  font-size: 14px !important;
  line-height: 22px !important;

  ::placeholder {
    color: ${Colors.grey8};
  }

  svg {
    color: ${Colors.grey8};
    margin-right: 8px;
  }
`;
