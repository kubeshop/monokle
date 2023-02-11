import {useAppSelector} from '@redux/hooks';

import {FileEntry} from '@shared/models/fileEntry';

import * as S from './TreeNode.styled';
import {useIsDisabled} from './hooks';

type Props = {
  folderPath: string;
};

const TreeNodeFolder: React.FC<Props> = props => {
  const {folderPath} = props;
  const folderEntry: FileEntry | undefined = useAppSelector(state => state.main.fileMap[folderPath]);

  const isDisabled = useIsDisabled(folderEntry);

  if (!folderEntry) {
    return null;
  }

  return (
    <S.NodeContainer $isDisabled={isDisabled}>
      <S.TitleContainer>
        <S.TitleText>{folderEntry.name}</S.TitleText>
      </S.TitleContainer>
    </S.NodeContainer>
  );
};

export default TreeNodeFolder;
