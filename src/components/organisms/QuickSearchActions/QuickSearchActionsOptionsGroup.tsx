import {useCallback, useEffect} from 'react';

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

  const colorMatchingCharacters = useCallback(() => {
    if (!options || !options.length || !searchingValue) {
      return;
    }

    options.forEach(option => {
      const element = document.getElementById(option) as HTMLSpanElement;

      const optionValue = element.textContent;

      let newValue = '';

      if (optionValue) {
        for (let i = 0; i < optionValue.length; i += 1) {
          if (searchingValue[i] === optionValue[i].toLowerCase()) {
            newValue += `<span class='matchingCharacter'>${optionValue[i]}</span>`;
          } else {
            newValue += optionValue[i];
          }
        }
      }

      element.innerHTML = newValue;
    });
  }, [options, searchingValue]);

  useEffect(() => {
    document.addEventListener('keyup', colorMatchingCharacters);

    return () => {
      document.removeEventListener('keyup', colorMatchingCharacters);
    };
  }, [colorMatchingCharacters]);

  if (!options || !options.length) {
    return null;
  }

  return (
    <GroupContainer>
      <GroupLabel>{LabelMapper[type]}</GroupLabel>
      {options.map(option => (
        <OptionLabel onClick={() => onOptionClick(type, option)} key={option} id={option}>
          {option}
        </OptionLabel>
      ))}
    </GroupContainer>
  );
};

export default QuickSearchActionsOptionsGroup;
