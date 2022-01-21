import {Button} from 'antd';

import {FormOutlined as RawFormOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const AdditionalInformation = styled.div`
  color: ${Colors.grey6};
  line-height: 20px;
  font-size: 12px;
  margin: 10px 0px;
  display: flex;
  flex-direction: column;
`;

export const Container = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-column-gap: 18px;
  position: relative;
  margin-bottom: 25px;
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

export const Name = styled.span<{$width: number}>`
  ${props => `width: ${props.$width}`}
  color:${Colors.whitePure};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 10px;
`;

export const FormOutlined = styled(RawFormOutlined)`
  font-size: 30px;
`;

export const OpenButton = styled(Button)`
  width: max-content;
`;
