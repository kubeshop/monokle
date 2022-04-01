import React from 'react';

import {Modal} from 'antd';

import * as S from './styled';

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
        <S.TitleContainer>
          <S.TitleIcon />
          Confirmation
        </S.TitleContainer>
      }
      onOk={onOk}
      onCancel={onCancel}
    >
      {text}
    </Modal>
  );
};

export default React.memo(ModalConfirm);
