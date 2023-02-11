import {useAppSelector} from '@redux/hooks';

import {FileEntry} from '@shared/models/fileEntry';

import * as S from './TreeNode.styled';
import {useCanPreview, useIsDisabled} from './hooks';

type Props = {
  filePath: string;
};

const TreeNodeFile: React.FC<Props> = props => {
  const {filePath} = props;
  const fileEntry: FileEntry | undefined = useAppSelector(state => state.main.fileMap[filePath]);

  const isSelected = useAppSelector(
    state => state.main.selection?.type === 'file' && state.main.selection.filePath === filePath
  );
  const isDisabled = useIsDisabled(fileEntry);
  const canBePreviewed = useCanPreview(fileEntry, isDisabled);

  if (!fileEntry) {
    return null;
  }

  return (
    <S.NodeContainer $isDisabled={isDisabled}>
      <S.TitleContainer>
        <S.TitleText>{fileEntry.name}</S.TitleText>

        {canBePreviewed && <S.PreviewIcon $isSelected={isSelected} />}
      </S.TitleContainer>
    </S.NodeContainer>
  );
};

export default TreeNodeFile;
