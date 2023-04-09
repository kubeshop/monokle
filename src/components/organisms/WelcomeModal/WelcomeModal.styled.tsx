import {CloseOutlined as RawCloseOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const CloseOutlined = styled(RawCloseOutlined)`
  position: absolute;
  right: 15px;
  top: 12px;
  color: ${Colors.grey8};
  cursor: pointer;
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Content = styled.div`
  color: ${Colors.grey2};
  max-width: 300px;
`;

export const Image = styled.img`
  width: 330;
  max-width: 330;
  margin: 15px auto 20px auto;
`;

export const Title = styled.h1`
  color: ${Colors.geekblue8};
  font-weight: 700;
  font-size: 40px;
  line-height: 40px;
`;
