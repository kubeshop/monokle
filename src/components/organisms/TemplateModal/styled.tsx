import {Modal as AntModal, Input, Steps} from 'antd';

import {FormOutlined as RawFormOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import TemplateIconSvg from '@assets/TemplateIcon.svg';

import Colors from '@styles/Colors';

export const Container = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-column-gap: 10px;
  margin: 24px 0px;
`;

export const FormContainer = styled.div`
  padding-right: 10px;
  max-height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
`;

export const FormOutlined = styled(RawFormOutlined)`
  font-size: 22px;
  margin-right: 10px;
`;

export const Modal = styled(AntModal)`
  & .custom-modal-handle {
    position: absolute;
    top: 50%;
    height: 100%;
    width: 10px;
    background-color: transparent;
    cursor: col-resize;
    transform: translateY(-50%);
  }

  & .custom-modal-handle-e {
    right: -5px;
  }

  & .custom-modal-handle-w {
    left: -5px;
  }

  & .ant-modal-body {
    padding-top: 0;
  }
`;

export const Step = styled(Steps.Step)`
  & .ant-steps-item-title {
    width: 155px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
`;

export const StepsContainer = styled.div`
  padding-right: 5px;
  max-height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
`;

export const StyledTextArea = styled(Input.TextArea)`
  margin-top: 20px;
  width: 100%;
  ::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }
`;

export const Table = styled.table`
  width: 100%;
`;

export const TableHead = styled.th`
  width: 120px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgb(48, 48, 48);
  padding: 8px;
  font-weight: 400;
`;

export const TableData = styled.td`
  border: 1px solid rgb(48, 48, 48);
  padding: 5px 10px;
`;

export const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 20px;
`;

export const CreatedResourceLabel = styled.p`
  font-weight: 600;
`;

export const CreatedResourceName = styled.span`
  margin-left: 10px;
  color: ${Colors.yellow7};
`;

export const CreatedResourceKind = styled.span`
  margin-left: 10px;
  font-style: italic;
`;

export const TemplateIcon: React.FC = () => {
  return <img src={TemplateIconSvg} style={{width: 20, height: 20, marginRight: 8}} />;
};

export const ModalTitle = styled.span`
  display: flex;
`;
