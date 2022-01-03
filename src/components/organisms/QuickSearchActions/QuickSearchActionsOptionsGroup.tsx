import styled from 'styled-components';

import Colors from '@styles/Colors';

import LabelMapper, {LabelTypes} from './LabelMapper';

interface IProps {
  options: string[];
  type: LabelTypes;
}

const GroupContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 0;
`;

const GroupLabel = styled.span`
  font-size: 12px;
  color: ${Colors.grey8};
  padding: 0px 20px;
  margin-bottom: 4px;
`;

const OptionLabel = styled.span`
  cursor: pointer;
  padding: 0px 20px;
  color: ${Colors.whitePure};

  &:hover {
    background: ${Colors.grey3};
  }
`;

const QuickSearchActionsOptionsGroup: React.FC<IProps> = props => {
  const {type, options} = props;

  if (!options.length) {
    return null;
  }

  return (
    <GroupContainer>
      <GroupLabel>{LabelMapper[type]}</GroupLabel>
      {options.map(option => (
        <OptionLabel key={option}>{option}</OptionLabel>
      ))}
    </GroupContainer>
  );
};

export default QuickSearchActionsOptionsGroup;
