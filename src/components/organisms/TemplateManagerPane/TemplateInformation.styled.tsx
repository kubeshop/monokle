import {DeleteOutlined as RawDeleteOutlined, FormOutlined as RawFormOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Container = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr;
  position: relative;
  margin-bottom: 16px;
`;

export const IconContainer = styled.span`
  height: 50px;
  width: 50px;
`;

export const InfoContainer = styled.span`
  display: flex;
  flex-direction: column;
`;

export const Name = styled.span`
  font-weight: 600;
`;

export const Description = styled.span`
  font-weight: 300;
`;

export const Footer = styled.span`
  display: flex;
  justify-content: space-between;
`;

export const Author = styled.span`
  color: ${Colors.grey500};
`;

export const Version = styled.span`
  font-style: italic;
`;

export const DeleteOutlined = styled(RawDeleteOutlined)`
  position: absolute;
  top: 5px;
  right: 0px;
  color: ${Colors.red7};
  cursor: pointer;
`;

export const FormOutlined = styled(RawFormOutlined)`
  font-size: 30px;
  padding-top: 4px;
`;
