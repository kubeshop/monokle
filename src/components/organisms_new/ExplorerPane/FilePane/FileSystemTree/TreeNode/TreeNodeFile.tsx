import {useCallback, useRef, useState} from 'react';

import {useAppSelector} from '@redux/hooks';
import {isInClusterModeSelector, isInPreviewModeSelectorNew} from '@redux/selectors';

import {ContextMenu, Dots} from '@components/atoms';

import {Spinner} from '@monokle/components';
import {FileEntry} from '@shared/models/fileEntry';
import {Colors} from '@shared/styles';

import * as S from './TreeNode.styled';
import {useCanPreview, useDelete, useIsDisabled, useMenuItems} from './hooks';

type Props = {
  filePath: string;
};

const TreeNodeFile: React.FC<Props> = props => {
  const {filePath} = props;
  const fileEntry: FileEntry | undefined = useAppSelector(state => state.main.fileMap[filePath]);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);
  const [isHovered, setIsHovered] = useState(false);
  const isSelected = useAppSelector(
    state => state.main.selection?.type === 'file' && state.main.selection.filePath === filePath
  );
  const isDisabled = useIsDisabled(fileEntry);
  const canBePreviewed = useCanPreview(fileEntry, isDisabled);
  const {deleteEntry, isDeleteLoading} = useDelete();

  const contextMenuButtonRef = useRef<HTMLDivElement>(null);

  const menuItems = useMenuItems({canBePreviewed, isInClusterMode, isInPreviewMode}, fileEntry);

  const onContextMenu = useCallback(() => {
    if (isDisabled || !contextMenuButtonRef.current) {
      return;
    }
    contextMenuButtonRef.current.click();
  }, [isDisabled]);

  if (!fileEntry) {
    return null;
  }

  return (
    <S.NodeContainer
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={onContextMenu}
      $isDisabled={isDisabled}
    >
      <S.TitleContainer>
        <S.TitleText>{fileEntry.name}</S.TitleText>

        {canBePreviewed && <S.PreviewIcon $isSelected={isSelected} />}
      </S.TitleContainer>

      {isDeleteLoading && (
        <S.SpinnerContainer>
          <Spinner />
        </S.SpinnerContainer>
      )}

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
          {!isDisabled && (
            <ContextMenu items={menuItems}>
              <div ref={contextMenuButtonRef}>
                <Dots color={isSelected ? Colors.blackPure : undefined} />
              </div>
            </ContextMenu>
          )}
        </S.ActionButtonsContainer>
      )}
    </S.NodeContainer>
  );
};

export default TreeNodeFile;
