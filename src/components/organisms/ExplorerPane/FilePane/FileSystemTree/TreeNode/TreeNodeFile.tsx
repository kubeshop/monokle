import {memo, useCallback, useRef, useState} from 'react';
import {useMeasure} from 'react-use';

import {Tooltip} from 'antd';

import {join} from 'path';

import {TOOLTIP_DELAY} from '@constants/constants';

import {useAppSelector} from '@redux/hooks';
import {selectionFilePathSelector} from '@redux/selectors';

import {ContextMenu, Dots} from '@components/atoms';

import {Spinner} from '@monokle/components';
import {FileEntry} from '@shared/models/fileEntry';
import {Colors} from '@shared/styles';
import {isEqual} from '@shared/utils/isEqual';

import * as S from './TreeNode.styled';
import {useCanPreview, useDelete, useFileMenuItems, useIsDisabled, usePreview} from './hooks';

type Props = {
  filePath: string;
};

const TreeNodeFile: React.FC<Props> = props => {
  const {filePath} = props;
  const fileEntry: FileEntry | undefined = useAppSelector(state => state.main.fileMap[filePath]);

  const selectedFilePath = useAppSelector(selectionFilePathSelector);

  const isSelected = selectedFilePath === filePath;
  const isDisabled = useIsDisabled(fileEntry);
  const canBePreviewed = useCanPreview(fileEntry, isDisabled);
  const {deleteEntry, isDeleteLoading} = useDelete();
  const preview = usePreview();

  const [isHovered, setIsHovered] = useState(false);

  const contextMenuButtonRef = useRef<HTMLDivElement>(null);
  const [actionButtonsRef, {width: actionButtonsWidth}] = useMeasure<HTMLDivElement>();

  const menuItems = useFileMenuItems({deleteEntry, canBePreviewed}, fileEntry);

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
      <S.TitleContainer $actionButtonsWidth={actionButtonsWidth} $isHovered={isHovered}>
        <S.TitleText $isSelected={isSelected} $isExcluded={fileEntry.isExcluded}>
          <Tooltip
            overlayStyle={{fontSize: '12px', wordBreak: 'break-all'}}
            mouseEnterDelay={TOOLTIP_DELAY}
            title={
              fileEntry.rootFolderPath === fileEntry.filePath
                ? fileEntry.filePath
                : join(fileEntry.rootFolderPath, fileEntry.filePath)
            }
            placement="bottom"
          >
            {fileEntry.name}
          </Tooltip>
        </S.TitleText>

        {canBePreviewed && <S.PreviewIcon $isSelected={isSelected} />}
      </S.TitleContainer>

      {isDeleteLoading && (
        <S.SpinnerContainer>
          <Spinner />
        </S.SpinnerContainer>
      )}

      <S.ActionButtonsContainer ref={actionButtonsRef} onClick={e => e.stopPropagation()}>
        {canBePreviewed && (
          <S.PreviewButton
            type="text"
            size="small"
            $isItemSelected={isSelected}
            onClick={() => preview(fileEntry.filePath)}
          >
            Dry-run
          </S.PreviewButton>
        )}

        {isHovered ? (
          <ContextMenu items={menuItems}>
            <div ref={contextMenuButtonRef}>
              <Dots color={isSelected ? Colors.blackPure : undefined} />
            </div>
          </ContextMenu>
        ) : (
          <S.ContextMenuPlaceholder />
        )}
      </S.ActionButtonsContainer>
    </S.NodeContainer>
  );
};

export default memo(TreeNodeFile, isEqual);
