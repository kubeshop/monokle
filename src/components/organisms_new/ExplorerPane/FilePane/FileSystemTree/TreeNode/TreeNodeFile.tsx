import {useRef} from 'react';
import {useHoverDirty} from 'react-use';

import {useAppSelector} from '@redux/hooks';
import {isInClusterModeSelector, isInPreviewModeSelectorNew} from '@redux/selectors';

import {Spinner} from '@monokle/components';
import {FileEntry} from '@shared/models/fileEntry';

import * as S from './TreeNode.styled';
import {useCanPreview, useDelete, useIsDisabled} from './hooks';

type Props = {
  filePath: string;
};

const TreeNodeFile: React.FC<Props> = props => {
  const {filePath} = props;
  const fileEntry: FileEntry | undefined = useAppSelector(state => state.main.fileMap[filePath]);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);
  const nodeContainerRef = useRef<HTMLDivElement>(null);
  const isHovered = useHoverDirty(nodeContainerRef);
  const isSelected = useAppSelector(
    state => state.main.selection?.type === 'file' && state.main.selection.filePath === filePath
  );
  const isDisabled = useIsDisabled(fileEntry);
  const canBePreviewed = useCanPreview(fileEntry, isDisabled);
  const {deleteEntry, isDeleteLoading} = useDelete();

  if (!fileEntry) {
    return null;
  }

  return (
    <S.NodeContainer ref={nodeContainerRef} $isDisabled={isDisabled}>
      <S.TitleContainer>
        <S.TitleText>{fileEntry.name}</S.TitleText>

        {canBePreviewed && <S.PreviewIcon $isSelected={isSelected} />}
      </S.TitleContainer>
      <S.SpinnerContainer>
        <Spinner />
      </S.SpinnerContainer>

      {isHovered && (
        <S.ActionButtonsContainer>
          {canBePreviewed && (
            <S.PreviewButton
              type="text"
              size="small"
              disabled={isInPreviewMode || isInClusterMode}
              $isItemSelected={isSelected}
            >
              Preview
            </S.PreviewButton>
          )}
        </S.ActionButtonsContainer>
      )}
    </S.NodeContainer>
  );
};

export default TreeNodeFile;
