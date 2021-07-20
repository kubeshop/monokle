import {Typography, Col} from 'antd';
import styled from 'styled-components';

const {Title} = Typography;

const StyledSectionTitle = styled(Title)`
  &.ant-typography {
    text-transform: uppercase;
    margin-bottom: 0;
  }
`;

const StyledSectionHeader = styled(Col)`
  padding: 12px 16px;
  border-bottom: 1px solid #363636;
`;

<StyledSectionHeader span={24}>
  <StyledSectionTitle level={5}>Editor</StyledSectionTitle>
</StyledSectionHeader>;

interface HeaderProps {
  children: React.ReactNode;
}

const SectionHeader = ({children}: HeaderProps): JSX.Element => {
  return <StyledSectionHeader span={24}>{children}</StyledSectionHeader>;
};

const SectionTitle = ({children}: HeaderProps): JSX.Element => {
  return <StyledSectionTitle level={5}>{children}</StyledSectionTitle>;
};

export {SectionHeader, SectionTitle};
