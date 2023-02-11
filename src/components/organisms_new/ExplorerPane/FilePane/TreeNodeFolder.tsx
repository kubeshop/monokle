import {useAppSelector} from '@redux/hooks';

import {FileEntry} from '@shared/models/fileEntry';

import * as S from './TreeNode.styled';

type Props = {
  folderPath: string;
};

const TreeNodeFolder: React.FC<Props> = props => {
  const {folderPath} = props;
  const folderEntry: FileEntry | undefined = useAppSelector(state => state.main.fileMap[folderPath]);

  if (!folderEntry) {
    return null;
  }

  return (
    <S.NodeContainer $isDisabled={false}>
      <S.TitleContainer>
        <S.TitleText>{folderEntry.name}</S.TitleText>
      </S.TitleContainer>
    </S.NodeContainer>
  );
};

export default TreeNodeFolder;
