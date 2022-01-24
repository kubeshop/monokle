import {AppstoreOutlined as RawAppstoreOutlined, DeleteOutlined as RawDeleteOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Container = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-column-gap: 18px;
  position: relative;
  margin-bottom: 16px;
`;

export const IconContainer = styled.span`
  height: 32px;
  width: 32px;
`;

export const InfoContainer = styled.span`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const Name = styled.span`
  width: 100%;
  color: ${Colors.whitePure};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 6px;
`;

export const Description = styled.span`
  color: ${Colors.grey7};
`;

export const AdditionalInformation = styled.div`
  color: ${Colors.grey6};
  line-height: 20px;
  font-size: 12px;
  margin: 6px 0px;
  display: flex;
  flex-direction: column;
`;

export const DeleteOutlined = styled(RawDeleteOutlined)`
  position: absolute;
  top: 5px;
  right: 5px;
  color: ${Colors.red7};
  cursor: pointer;
`;

export const AppstoreOutlined = styled(RawAppstoreOutlined)`
  font-size: 30px;
  padding-top: 4px;
`;
