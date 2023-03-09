import {Popover} from 'antd';

import {Icon} from '@monokle/components';
import {ItemInstance} from '@shared/models/navigator';
import {Colors} from '@shared/styles/colors';

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
        <Icon name="outgoingRefs" style={{color: isSelected ? Colors.blackPure : Colors.blue10}} />
      </Popover>
    </S.Container>
  );
};

export default ImagesSectionNameSuffix;
