import {useState} from 'react';

import {Modal} from 'antd';

import {cloneDeep} from 'lodash';

import {AlertEnum} from '@models/alert';
import {SavedCommand} from '@models/appconfig';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {updateProjectConfig} from '@redux/reducers/appConfig';

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

  return (
    <S.LabelContainer onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {isPreviewed ? <S.PreviewedLabel>{command.label}</S.PreviewedLabel> : <span>{command.label}</span>}
      {isHovered && <S.DeleteOutlined onClick={onClickDelete} />}
    </S.LabelContainer>
  );
};

export default CommandLabel;
