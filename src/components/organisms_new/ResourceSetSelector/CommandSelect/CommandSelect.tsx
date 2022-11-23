import {Select} from 'antd';

import invariant from 'tiny-invariant';

import {resourceSetSelected, selectCommandResourceSet} from '@redux/compare';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {CompareSide, PartialResourceSet} from '@monokle-desktop/shared/models/compare';

import * as S from '../ResourceSetSelectColor.styled';

type IProps = {
  side: CompareSide;
};

const CommandSelect: React.FC<IProps> = ({side}) => {
  const dispatch = useAppDispatch();
  const resourceSet = useAppSelector(state => selectCommandResourceSet(state, side));
  invariant(resourceSet, 'invalid_state');

  const {allSavedCommands, currentCommand} = resourceSet;

  const handleSelect = (commandId: string) => {
    const value: PartialResourceSet = {type: 'command', commandId};
    dispatch(resourceSetSelected({side, value}));
  };

  return (
    <S.SelectColor>
      <Select
        defaultOpen={!resourceSet}
        onChange={handleSelect}
        placeholder="Choose Command..."
        value={currentCommand?.label}
        style={{width: 200}}
      >
        {allSavedCommands.map(cmd => (
          <Select.Option key={cmd.id} value={cmd.id}>
            {cmd.label}
          </Select.Option>
        ))}
      </Select>
    </S.SelectColor>
  );
};

export default CommandSelect;
