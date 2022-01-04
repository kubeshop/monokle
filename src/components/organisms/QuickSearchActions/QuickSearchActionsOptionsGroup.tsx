import {useCallback, useEffect} from 'react';

import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateResourceFilter} from '@redux/reducers/main';

import Colors from '@styles/Colors';

import LabelMapper, {LabelTypes} from './LabelMapper';

interface IProps {
  options: string[];
  searchingValue: string;
  type: LabelTypes;
  onOptionClick: () => void;
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

  const dispatch = useAppDispatch();
  const resourceFilter = useAppSelector(state => state.main.resourceFilter);

  const onClick = (option: string) => {
    if (type === 'namespace' && (!resourceFilter.namespace || resourceFilter.namespace !== option)) {
      dispatch(updateResourceFilter({...resourceFilter, namespace: option}));
    } else if (type === 'kind' && (!resourceFilter.kind || resourceFilter.kind !== option)) {
      dispatch(updateResourceFilter({...resourceFilter, kind: option}));
    }

    onOptionClick();
  };

  const colorMatchingCharacters = useCallback(() => {
    if (!options || !options.length || !searchingValue) {
      return;
    }

    options.forEach(option => {
      const domOption = document.getElementById(option) as HTMLSpanElement;

      const optionValue = domOption.textContent;

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

      domOption.innerHTML = newValue;
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
        <OptionLabel onClick={() => onClick(option)} key={option} id={option}>
          {option}
        </OptionLabel>
      ))}
    </GroupContainer>
  );
};

export default QuickSearchActionsOptionsGroup;
