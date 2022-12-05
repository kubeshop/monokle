import {useMemo} from 'react';

import {MinusSquareOutlined, PlusSquareOutlined} from '@ant-design/icons';

import {useAppSelector} from '@redux/hooks';

import {SectionCustomComponentProps} from '@shared/models/navigator';
import {Colors} from '@shared/styles/colors';

const CollapseSectionPrefix = (props: SectionCustomComponentProps) => {
  const {sectionInstance, onClick} = props;

  const isSectionCollapsed = useAppSelector(state => state.navigator.collapsedSectionIds.includes(sectionInstance.id));

  const iconProps = useMemo(() => {
    return {
      style: {
        color: sectionInstance.isSelected && isSectionCollapsed ? Colors.blackPure : Colors.grey9,
        marginLeft: 4,
        marginRight: 8,
      },
      fontSize: 10,
      cursor: 'pointer',
      onClick,
    };
  }, [sectionInstance.isSelected, isSectionCollapsed, onClick]);

  if (isSectionCollapsed) {
    return <PlusSquareOutlined {...iconProps} />;
  }

  return <MinusSquareOutlined {...iconProps} />;
};

export default CollapseSectionPrefix;
