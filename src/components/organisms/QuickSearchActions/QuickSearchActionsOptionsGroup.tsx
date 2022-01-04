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

const GroupContainer = styled.ul`
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  list-style-type: none;
  margin-bottom: 0px;
`;

const GroupLabel = styled.span`
  font-size: 12px;
  color: ${Colors.grey8};
  padding: 0px 20px;
  margin-bottom: 4px;
`;

const OptionLabel = styled.li`
  cursor: pointer;
  padding: 1px 20px;
  color: ${Colors.whitePure};

  &:focus {
    background: ${Colors.grey3};
    outline: none;
  }

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

  const focusOptionHandler = (e: React.KeyboardEvent<HTMLLIElement>, id: string, option: string) => {
    e.preventDefault();

    if (e.key === 'Enter') {
      onOptionClick(type, option);
    }
  };

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
            tabIndex={0}
            onClick={() => onOptionClick(type, type === 'resource' ? opt : option)}
            key={labelKey}
            id={labelKey}
            onKeyDown={e => {
              focusOptionHandler(e, type, type === 'resource' ? opt : option);
              e.preventDefault();

              if (e.key === 'Enter') {
                onOptionClick(type, type === 'resource' ? opt : option);
              }

              if (e.key === 'ArrowUp') {
                if (document.getElementById(labelKey)?.previousSibling?.nodeName !== 'SPAN') {
                  const previousOption = document.getElementById(labelKey)?.previousSibling as HTMLLIElement;

                  if (previousOption) {
                    previousOption.focus();
                  }

                  // check if there is a previous group of options
                } else if (document.getElementById(labelKey)?.parentElement?.previousSibling) {
                  const previousGroupLastOption = document.getElementById(labelKey)?.parentElement?.previousSibling
                    ?.lastChild as HTMLLIElement;

                  if (previousGroupLastOption) {
                    previousGroupLastOption.focus();
                  }

                  // focus the input
                } else {
                  document.getElementById('quick-search-input')?.focus();
                }
              }

              if (e.key === 'ArrowDown') {
                if (document.getElementById(labelKey)?.nextSibling) {
                  const nextOption = document.getElementById(labelKey)?.nextSibling as HTMLLIElement;

                  if (nextOption) {
                    nextOption.focus();
                  }

                  // check if there is a next group of options
                } else if (document.getElementById(labelKey)?.parentElement?.nextSibling) {
                  const nextGroup = document.getElementById(labelKey)?.parentElement?.nextSibling as HTMLUListElement;
                  if (nextGroup) {
                    const nextGroupFirstOption = nextGroup.getElementsByTagName('li')[0];

                    if (nextGroupFirstOption) {
                      nextGroupFirstOption.focus();
                    }
                  }
                }
              }
            }}
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
