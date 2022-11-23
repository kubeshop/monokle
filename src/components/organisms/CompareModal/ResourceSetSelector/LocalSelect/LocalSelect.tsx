import {TreeSelect} from 'antd';

import {CompareSide, PartialResourceSet, resourceSetSelected, selectResourceSet} from '@redux/compare';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {useFolderTreeSelectData} from '@hooks/useFolderTreeSelectData';

import * as S from '../ResourceSetSelectColor.styled';

type IProps = {
  side: CompareSide;
};

const LocalSelect: React.FC<IProps> = ({side}) => {
  const resourceSet = useAppSelector(state => selectResourceSet(state.compare, side));
  const dispatch = useAppDispatch();
  const treeData = useFolderTreeSelectData();

  const handleSelect = (folder: string) => {
    const value: PartialResourceSet = {type: 'local', folder};
    dispatch(resourceSetSelected({side, value}));
  };

  return (
    <S.SelectColor>
      <TreeSelect
        value={resourceSet?.type === 'local' ? resourceSet.folder : ''}
        treeDefaultExpandedKeys={['<root>']}
        dropdownMatchSelectWidth={false}
        onChange={handleSelect}
        placeholder="Choose Folder..."
        style={{width: 180}}
        treeData={[treeData]}
      />
    </S.SelectColor>
  );
};

export default LocalSelect;
