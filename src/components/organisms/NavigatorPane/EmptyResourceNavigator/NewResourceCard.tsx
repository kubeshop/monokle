import {useCallback, useMemo, useState} from 'react';

import {Image} from 'antd';

import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';

import {NewResourceAction} from '@shared/models/resourceCreate';
import {Colors} from '@shared/styles/colors';
import {isInClusterModeSelector} from '@shared/utils';

type IProps = {
  action: NewResourceAction;
};

const NewResourceCard: React.FC<IProps> = props => {
  const {
    action: {hoverImage, image, typeLabel, onClick},
  } = props;

  const isInClusterMode = useAppSelector(isInClusterModeSelector);

  const [isHovered, setIsHovered] = useState(false);

  const isDisabled = useMemo(() => isInClusterMode, [isInClusterMode]);

  const onClickHanlder = useCallback(() => {
    if (isDisabled) {
      return;
    }

    onClick();
  }, [isDisabled, onClick]);

  return (
    <CardContainer
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClickHanlder}
      $isDisabled={isDisabled}
    >
      <Image src={isHovered && !isDisabled ? hoverImage : image} preview={false} />

      <CardLabel>
        <span>New resource</span>

        <span>
          using <b>{typeLabel}</b>
        </span>
      </CardLabel>
    </CardContainer>
  );
};

export default NewResourceCard;

// Styled Components

const CardContainer = styled.div<{$isDisabled: boolean}>`
  display: flex;
  gap: 24px;
  align-items: center;
  border: 1px solid ${Colors.grey2};
  border-radius: 4px;
  padding: 24px;
  cursor: ${({$isDisabled}) => ($isDisabled ? 'not-allowed' : 'pointer')};

  &:hover {
    background-color: ${({$isDisabled}) => ($isDisabled ? 'transparent' : Colors.blue7)};
  }
`;

const CardLabel = styled.div`
  display: flex;
  flex-direction: column;
  color: ${Colors.grey9};
`;
