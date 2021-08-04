import React from 'react';
import styled from 'styled-components';
import {Tooltip} from 'antd';

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
    <Tooltip title={tooltip}>
      <StyledWrapper>
        {icon}
        {children}
      </StyledWrapper>
    </Tooltip>
  );
};

export default TabHeader;
