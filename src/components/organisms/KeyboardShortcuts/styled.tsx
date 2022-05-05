import {Modal} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const StyledModal = styled(Modal)`
  .ant-modal-close-icon {
    font-size: 14px !important;
    color: ${Colors.grey700};
  }
  .ant-modal-body {
    position: relative;
    overflow: auto;
    background-color: ${Colors.grey1};
  }
  .ant-modal-footer {
    padding-top: 20px;
    background-color: ${Colors.grey1000};
  }
`;

export const ContentContainerDiv = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  padding: 12px 24px;

  img {
    padding: 30px 0;
    display: block;
    margin: 0 auto;
  }
`;

export const HeightFillDiv = styled.div`
  display: block;
  height: 440px;
`;

export const StyledContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const StyledTextBlock = styled.table`
  display: block;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
  overflow: hidden;
  .ant-typography {
    display: block;
  }
`;

export const ShortCutContainer = styled.tr``;

export const StyledShortCut = styled.div`
  display: flex;
`;

export const StyledKey = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 5px 10px;
  background: ${Colors.cyan7};
  color: ${Colors.blackPearl};
  margin-left: 5px;
  border: 1px solid #33bcb7;
  box-sizing: border-box;
  box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.016);
  border-radius: 2px;
`;
