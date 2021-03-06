import {Popover} from 'antd';

import {ItemInstance} from '@models/navigator';

import {Icon} from '@atoms';

import Colors from '@styles/Colors';

import ImageOutgoingResourcesPopover from './ImageOutgoingResourcesPopover';
import * as S from './ImagesSectionNameSuffix.styled';

interface IProps {
  itemInstance: ItemInstance;
}

const ImagesSectionNameSuffix: React.FC<IProps> = props => {
  const {
    itemInstance: {
      isSelected,
      meta: {resourcesIds},
    },
  } = props;

  return (
    <S.Container>
      <S.Counter $selected={isSelected}>{resourcesIds.length}</S.Counter>

      <Popover
        mouseEnterDelay={0.5}
        content={<ImageOutgoingResourcesPopover resourcesIds={resourcesIds} />}
        placement="rightTop"
      >
        <Icon name="outgoingRefs" color={isSelected ? Colors.blackPure : Colors.blue10} />
      </Popover>
    </S.Container>
  );
};

export default ImagesSectionNameSuffix;
