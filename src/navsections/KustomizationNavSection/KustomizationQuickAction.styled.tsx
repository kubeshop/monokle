import {LoadingOutlined} from '@ant-design/icons';
import Colors from '@styles/Colors';
import styled from 'styled-components';

export const PreviewLoadingIcon = <LoadingOutlined style={{fontSize: 16}} spin />;

export const PreviewSpan = styled.span<{isSelected: boolean}>`
  font-weight: 500;
  cursor: pointer;
  color: ${props => (props.isSelected ? Colors.blackPure : Colors.blue6)};
`;

export const ReloadSpan = styled.span<{isSelected: boolean}>`
  margin-left: 10px;
  font-weight: 500;
  cursor: pointer;
  color: ${props => (props.isSelected ? Colors.blackPure : Colors.blue6)};
`;
