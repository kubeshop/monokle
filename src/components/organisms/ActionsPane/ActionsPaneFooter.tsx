import React, {useCallback} from 'react';

import {Divider} from 'antd';

import {ArrowDownOutlined, ArrowUpOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {ACTIONS_PANE_FOOTER_HEIGHT} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {toggleExpandActionsPaneFooter} from '@redux/reducers/ui';

import Colors from '@styles/Colors';

const TitleBar = styled.div`
  height: 25px;
  width: 100%;
  background-color: ${Colors.grey900};
  display: flex;
  align-items: center;
`;

const TitleBarRightButtons = styled.div`
  margin-left: auto;
`;

const ArrowContainer = styled.span`
  margin-right: 4px;
  padding: 0 8px;
  cursor: pointer;
`;

const Container = styled.div`
  min-height: 0;
  width: 100%;
`;

const Pane = styled.div`
  height: ${ACTIONS_PANE_FOOTER_HEIGHT}px;
  background-color: ${Colors.grey900};
`;

const ActionsPaneFooter = () => {
  const dispatch = useAppDispatch();
  const isExpanded = useAppSelector(state => state.ui.isActionsPaneFooterExpanded);
  const toggleIsExpanded = useCallback(() => {
    dispatch(toggleExpandActionsPaneFooter());
  }, [dispatch]);

  return (
    <Container>
      <TitleBar>
        <TitleBarRightButtons>
          <ArrowContainer onClick={toggleIsExpanded}>
            {isExpanded ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
          </ArrowContainer>
        </TitleBarRightButtons>
      </TitleBar>
      {isExpanded && (
        <Pane>
          <Divider style={{margin: 0}} />
        </Pane>
      )}
    </Container>
  );
};

export default ActionsPaneFooter;
