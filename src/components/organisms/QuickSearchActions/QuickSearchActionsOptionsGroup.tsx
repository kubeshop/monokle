import styled from 'styled-components';

import Colors from '@styles/Colors';

import LabelMapper, {LabelTypes} from './LabelMapper';

interface IProps {
  options: string[];
  searchingValue: string;
  type: LabelTypes;
  onOptionClick: (type: string, option: string) => void;
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

  & .matchingCharacter {
    color: ${Colors.cyan7};
  }
`;

const QuickSearchActionsOptionsGroup: React.FC<IProps> = props => {
  const {type, options, searchingValue, onOptionClick} = props;

  if (!options || !options.length) {
    return null;
  }

  return (
    <GroupContainer>
      <GroupLabel>{LabelMapper[type]}</GroupLabel>

      {options.map((option, index) => {
        const regex = new RegExp(`(${searchingValue})`, 'gi');
        const parts = option.split(regex);

        return (
          <OptionLabel onClick={() => onOptionClick(type, option)} key={option} id={option}>
            {parts.map((part, i) => {
              const key = `${option}-${index}-${part}-${i}`;

              if (part) {
                if (part.toLowerCase() === searchingValue) {
                  return (
                    <span key={key} className="matchingCharacter">
                      {part}
                    </span>
                  );
                }
                return part;
              }

              return '';
            })}
          </OptionLabel>
        );
      })}
    </GroupContainer>
  );
};

export default QuickSearchActionsOptionsGroup;
