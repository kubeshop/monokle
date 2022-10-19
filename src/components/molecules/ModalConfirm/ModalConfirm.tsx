import React from 'react';

import {Modal} from 'antd';

import * as S from './ModalConfirm.styled';

interface IProps {
  isVisible: boolean;
  text: string | JSX.Element;
  onOk: () => void;
  onCancel: () => void;
}

const ModalConfirm: React.FC<IProps> = props => {
  const {isVisible, text, onCancel, onOk} = props;

  return (
    <Modal
      centered
      open={isVisible}
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
