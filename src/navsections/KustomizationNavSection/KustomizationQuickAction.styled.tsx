import {LoadingOutlined} from '@ant-design/icons';
import Colors from '@styles/Colors';
import styled from 'styled-components';

export const PreviewLoadingIcon = <LoadingOutlined style={{fontSize: 16}} spin />;

export const PreviewSpan = styled.span<{isItemSelected: boolean}>`
  font-weight: 500;
  font-size: 12px;
  cursor: pointer;
  color: ${props => (props.isItemSelected ? Colors.blackPure : Colors.blue6)};
  margin-right: 15px;
`;

export const ReloadSpan = styled.span<{isItemSelected: boolean}>`
  margin-right: 15px;
  margin-left: 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  color: ${props => (props.isItemSelected ? Colors.blackPure : Colors.blue6)};
`;

export const Container = styled.span`
  display: flex;
  align-items: center;
`;
