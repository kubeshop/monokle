import {Button} from 'antd';

import {
  FormOutlined as RawFormOutlined,
  PushpinFilled as RawPushPinFilled,
  PushpinOutlined as RawPushPinOutlined,
} from '@ant-design/icons';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const AdditionalInformation = styled.div`
  color: ${Colors.grey6};
  line-height: 20px;
  font-size: 12px;
  margin: 6px 0px;
  display: flex;
  flex-direction: column;
`;

export const Container = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-column-gap: 18px;
  position: relative;
`;

export const Description = styled.span`
  color: ${Colors.grey7};
`;

export const Image = styled.img`
  width: 32px;
  height: 32px;
`;

export const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const NameContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  width: 100%;
  gap: 6px;
  justify-content: space-between;
`;

export const PinTemplateButton = styled(RawPushPinOutlined)`
  font-size: 24px;
  opacity: 0.8;
  &:hover {
    cursor: pointer;
    opacity: 0.5;
  }
`;

export const UnPinTemplateButton = styled(RawPushPinFilled)`
  font-size: 24px;
  opacity: 0.8;
  &:hover {
    cursor: pointer;
    opacity: 0.5;
  }
`;
export const Name = styled.span`
  color: ${Colors.whitePure};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 6px;
`;

export const FormOutlined = styled(RawFormOutlined)`
  font-size: 30px;
`;

export const OpenButton = styled(Button)`
  width: max-content;
  padding: 0px;
`;

export const Footer = styled.div`
  display: flex;
  justify-content: space-between;
`;
