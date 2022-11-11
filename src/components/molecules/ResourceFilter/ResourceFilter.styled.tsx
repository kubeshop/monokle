import {Button, Select} from 'antd';

import {CaretUpOutlined as RawCaretUpOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {Colors} from '@monokle-desktop/shared/styles';

export const CaretUpOutlined = styled(RawCaretUpOutlined)`
  color: ${Colors.whitePure};
  font-size: 10px;
  cursor: pointer;
  padding: 4px;
`;

export const Container = styled.div`
  padding: 10px 18px;
  height: 100%;
`;

export const SelectStyled = styled(props => <Select {...props} />)`
  width: 100%;
  margin-bottom: 1rem;
`;

export const Field = styled.div`
  margin-top: 5px;
  margin-bottom: 10px;
`;

export const FieldLabel = styled.div`
  font-weight: 500;
  margin-bottom: 5px;
`;

export const PresetButton = styled(Button)`
  padding: 0;
`;

export const TitleActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const TitleLabel = styled.span`
  color: ${Colors.grey9};
  font-weight: 600;
`;

export const TitleButton = styled(Button)`
  padding: 0;
  font-size: 16px;
`;
