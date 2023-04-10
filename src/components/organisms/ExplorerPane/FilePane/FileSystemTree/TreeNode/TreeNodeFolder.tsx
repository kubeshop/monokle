import {memo, useCallback, useRef, useState} from 'react';
import {useMeasure} from 'react-use';

import {Tooltip} from 'antd';

import {join} from 'path';

import {TOOLTIP_DELAY} from '@constants/constants';

import {isInClusterModeSelector} from '@redux/appConfig';
import {useAppSelector} from '@redux/hooks';
import {isInPreviewModeSelectorNew} from '@redux/selectors';

import {ContextMenu, Dots} from '@components/atoms';

import {Spinner} from '@monokle/components';
import {FileEntry} from '@shared/models/fileEntry';
import {isEqual} from '@shared/utils/isEqual';

import * as S from './TreeNode.styled';
import {useDelete, useFolderMenuItems, useIsDisabled} from './hooks';

type Props = {
  folderPath: string;
};

const TreeNodeFolder: React.FC<Props> = props => {
  const {folderPath} = props;
  const folderEntry: FileEntry | undefined = useAppSelector(state => state.main.fileMap[folderPath]);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);

  const [isHovered, setIsHovered] = useState(false);

  const {deleteEntry, isDeleteLoading} = useDelete();
  const isDisabled = useIsDisabled(folderEntry);

  const menuItems = useFolderMenuItems({deleteEntry, isInClusterMode, isInPreviewMode}, folderEntry);
  const contextMenuButtonRef = useRef<HTMLDivElement>(null);
  const [actionButtonsRef, {width: actionButtonsWidth}] = useMeasure<HTMLDivElement>();

  const onContextMenu = useCallback(() => {
    if (isDisabled || !contextMenuButtonRef.current) {
      return;
    }
    contextMenuButtonRef.current.click();
  }, [isDisabled]);

  if (!folderEntry) {
    return null;
  }

  return (
    <S.NodeContainer
      $isDisabled={isDisabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={onContextMenu}
    >
      <S.TitleContainer $actionButtonsWidth={actionButtonsWidth} $isHovered={isHovered}>
        <S.TitleText $isExcluded={folderEntry.isExcluded} $isSupported>
          <Tooltip
            overlayStyle={{fontSize: '12px', wordBreak: 'break-all'}}
            mouseEnterDelay={TOOLTIP_DELAY}
            title={
              folderEntry.rootFolderPath === folderEntry.filePath
                ? folderEntry.filePath
                : join(folderEntry.rootFolderPath, folderEntry.filePath)
            }
            placement="bottom"
          >
            <span>{folderEntry.name}</span>
          </Tooltip>
        </S.TitleText>
      </S.TitleContainer>

      {isDeleteLoading && (
        <S.SpinnerContainer>
          <Spinner />
        </S.SpinnerContainer>
      )}

      {isHovered && (
        <S.ActionButtonsContainer ref={actionButtonsRef} onClick={e => e.stopPropagation()}>
          <ContextMenu items={menuItems}>
            <div ref={contextMenuButtonRef}>
              <Dots />
            </div>
          </ContextMenu>
        </S.ActionButtonsContainer>
      )}
    </S.NodeContainer>
  );
};

export default memo(TreeNodeFolder, isEqual);
