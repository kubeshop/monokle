import React from "react";
import styled from 'styled-components';

interface TabHeaderProps {
    icon: React.ReactNode;
    children: React.ReactNode;
}

const StyledWrapper = styled.div`
    display: flex;
    align-items: center
`;

const TabHeader = ({children, icon}: TabHeaderProps): JSX.Element => {
    return <StyledWrapper>
        {icon}
        {children}
    </StyledWrapper>;
};

export default TabHeader;