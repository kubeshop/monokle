import React from 'react';

import {Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import Colors from '@styles/Colors';

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
`;

const TitleIcon = styled(ExclamationCircleOutlined)`
  margin-right: 10px;
  color: ${Colors.yellowWarning};
`;

interface IProps {
  isVisible: boolean;
  text: string;
  onOk: () => void;
  onCancel: () => void;
}

const ModalConfirm: React.FC<IProps> = props => {
  const {isVisible, text, onCancel, onOk} = props;

  return (
    <Modal
      centered
      visible={isVisible}
      title={
        <TitleContainer>
          <TitleIcon style={{marginRight: '10px', color: Colors.yellowWarning}} />
          Confirmation
        </TitleContainer>
      }
      onOk={onOk}
      onCancel={onCancel}
    >
      {text}
    </Modal>
  );
};

export default React.memo(ModalConfirm);
