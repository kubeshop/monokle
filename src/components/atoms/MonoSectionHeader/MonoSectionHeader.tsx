import React from 'react';
import styled from 'styled-components';
import Col, {ColProps} from '@atoms/Col';

export type MonoSectionHeaderProps = ColProps & {};

const MonoSectionHeader = styled((props: MonoSectionHeaderProps) => <Col {...props}/>)`
  padding: 12px 16px;
  border-bottom: 1px solid #363636;
`;

export default MonoSectionHeader;
