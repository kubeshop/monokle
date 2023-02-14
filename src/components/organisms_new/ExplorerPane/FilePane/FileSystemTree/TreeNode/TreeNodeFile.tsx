import {useCallback, useRef} from 'react';
import {useMeasure} from 'react-use';

import {Tooltip} from 'antd';

import {join} from 'path';

import {TOOLTIP_DELAY} from '@constants/constants';

import {useAppSelector} from '@redux/hooks';
import {isInClusterModeSelector, isInPreviewModeSelectorNew} from '@redux/selectors';

import {ContextMenu, Dots} from '@components/atoms';

import {Spinner} from '@monokle/components';
import {FileEntry} from '@shared/models/fileEntry';
import {Colors} from '@shared/styles';

import * as S from './TreeNode.styled';
import {useCanPreview, useDelete, useFileMenuItems, useIsDisabled} from './hooks';

type Props = {
  filePath: string;
};

const TreeNodeFile: React.FC<Props> = props => {
  const {filePath} = props;
  const fileEntry: FileEntry | undefined = useAppSelector(state => state.main.fileMap[filePath]);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);
  const isSelected = useAppSelector(
    state => state.main.selection?.type === 'file' && state.main.selection.filePath === filePath
  );
  const isDisabled = useIsDisabled(fileEntry);
  const canBePreviewed = useCanPreview(fileEntry, isDisabled);
  const {deleteEntry, isDeleteLoading} = useDelete();

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
    <S.NodeContainer onContextMenu={onContextMenu} $isDisabled={isDisabled} $actionButtonsWidth={actionButtonsWidth}>
      <S.TitleContainer>
        <S.TitleText>
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
            <span>{fileEntry.name}</span>
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
    </S.NodeContainer>
  );
};

export default TreeNodeFile;
