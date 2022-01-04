import {Tag} from 'antd';

import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';

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
  padding: 1px 20px;
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

  const resourceMap = useAppSelector(state => state.main.resourceMap);

  if (!options || !options.length) {
    return null;
  }

  return (
    <GroupContainer>
      <GroupLabel>{LabelMapper[type]}</GroupLabel>

      {options.map((opt, index) => {
        const option = type === 'resource' ? resourceMap[opt].name : opt;

        const labelKey = `${option}-${index}`;

        const inputValue = searchingValue.replaceAll('\\', '\\\\');
        const regex = new RegExp(`(${inputValue})`, 'gi');
        const parts = option.split(regex);

        return (
          <OptionLabel
            onClick={() => onOptionClick(type, type === 'resource' ? opt : option)}
            key={labelKey}
            id={option}
          >
            {type === 'resource' && resourceMap[opt].namespace && <Tag>{resourceMap[opt].namespace}</Tag>}
            <span>
              {parts.map((part, i) => {
                const key = `${labelKey}-${part}-${i}`;

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
            </span>
            {type === 'resource' && resourceMap[opt].kind && (
              <Tag style={{marginLeft: '8px'}}>{resourceMap[opt].kind}</Tag>
            )}
          </OptionLabel>
        );
      })}
    </GroupContainer>
  );
};

export default QuickSearchActionsOptionsGroup;
