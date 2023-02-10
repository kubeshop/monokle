import {useState} from 'react';

import {Modal} from 'antd';

import {cloneDeep} from 'lodash';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {updateProjectConfig} from '@redux/reducers/appConfig';
import {openSaveEditCommandModal} from '@redux/reducers/ui';

import {AlertEnum} from '@shared/models/alert';
import {SavedCommand} from '@shared/models/config';

import * as S from './CommandLabel.styled';

const CommandLabel: React.FC<{command: SavedCommand; isPreviewed: boolean}> = props => {
  const {command, isPreviewed} = props;

  const dispatch = useAppDispatch();

  const savedCommandMap = useAppSelector(state => state.config.projectConfig?.savedCommandMap || {});

  const [isHovered, setIsHovered] = useState<boolean>(false);

  const onClickDelete: React.MouseEventHandler<HTMLSpanElement> = e => {
    e.stopPropagation();

    Modal.confirm({
      title: `Are you sure you want to delete this command?`,
      onOk() {
        const savedCommandMapCopy = cloneDeep(savedCommandMap);
        savedCommandMapCopy[command.id] = null;

        dispatch(updateProjectConfig({config: {savedCommandMap: savedCommandMapCopy}, fromConfigFile: false}));
        dispatch(
          setAlert({type: AlertEnum.Success, title: `Successfully deleted the ${command.label} command`, message: ''})
        );
      },
      onCancel() {},
    });
  };

  const onClickEdit: React.MouseEventHandler<HTMLSpanElement> = () => {
    dispatch(openSaveEditCommandModal({command}));
  };

  return (
    <S.LabelContainer onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {isPreviewed ? <S.PreviewedLabel>{command.label}</S.PreviewedLabel> : <span>{command.label}</span>}
      {isHovered && (
        <S.ActionsContainer
          onClick={e => {
            e.stopPropagation();
          }}
        >
          <S.EditOutlined onClick={onClickEdit} />
          <S.DeleteOutlined onClick={onClickDelete} />
        </S.ActionsContainer>
      )}
    </S.LabelContainer>
  );
};

export default CommandLabel;
