import React from 'react';
import styled from 'styled-components';
import {Tooltip} from 'antd';
import {TOOLTIP_DELAY} from '@src/constants';

interface TabHeaderProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  tooltip: string;
}

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const TabHeader = ({children, icon, tooltip}: TabHeaderProps): JSX.Element => {
  return (
    <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={tooltip}>
      <StyledWrapper>
        {icon}
        {children}
      </StyledWrapper>
    </Tooltip>
  );
};

export default TabHeader;
