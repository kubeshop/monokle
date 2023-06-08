import {useState} from 'react';

import {Image} from 'antd';

import styled from 'styled-components';

import {NewResourceAction} from '@shared/models/resourceCreate';
import {Colors} from '@shared/styles/colors';

type IProps = {
  action: NewResourceAction;
};

const NewResourceCard: React.FC<IProps> = props => {
  const {
    action: {hoverImage, image, fromTypeLabel, onClick},
  } = props;

  const [isHovered, setIsHovered] = useState(false);

  return (
    <CardContainer onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={onClick}>
      <Image src={isHovered ? hoverImage : image} preview={false} />

      <CardLabel>
        <span>New resource</span>
        <span>
          from <b>{fromTypeLabel}</b>
        </span>
      </CardLabel>
    </CardContainer>
  );
};

export default NewResourceCard;

// Styled Components

const CardContainer = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
  border: 1px solid ${Colors.grey2};
  border-radius: 4px;
  padding: 24px;
  cursor: pointer;

  &:hover {
    background-color: ${Colors.blue7};
  }
`;

const CardLabel = styled.div`
  display: flex;
  flex-direction: column;
  color: ${Colors.grey9};
`;
