import {Popover} from 'antd';

import styled from 'styled-components';

import {Icon} from '@monokle/components';
import {Colors, FontColors} from '@shared/styles/colors';

import ImageOutgoingResourcesPopover from './ImageOutgoingResourcesPopover';

type IProps = {
  isSelected: boolean;
  resourcesIds: string[];
};

const ImageSuffix: React.FC<IProps> = props => {
  const {isSelected, resourcesIds} = props;

  return (
    <Container>
      <Counter $selected={isSelected}>{resourcesIds.length}</Counter>

      <Popover
        mouseEnterDelay={0.5}
        content={<ImageOutgoingResourcesPopover resourcesIds={resourcesIds} />}
        placement="rightTop"
      >
        <Icon name="outgoingRefs" style={{color: isSelected ? Colors.blackPure : Colors.blue10}} />
      </Popover>
    </Container>
  );
};

export default ImageSuffix;

// Styled Components

export const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Counter = styled.span<{$selected: boolean}>`
  ${({$selected}) => `
    color: ${$selected ? Colors.blackPure : FontColors.grey};
  `}

  margin-left: 6px;
  font-size: 12px;
`;
