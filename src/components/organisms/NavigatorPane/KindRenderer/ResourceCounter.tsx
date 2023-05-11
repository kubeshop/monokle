import {useMemo} from 'react';

import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';
import {navigatorResourcesSelector} from '@redux/selectors/resourceSelectors';

import {Colors, FontColors} from '@shared/styles';

type Props = {
  kind: string;
  isSelected: boolean;
  onClick: () => void;
};

function ResourceCounter({kind, isSelected, onClick}: Props) {
  const isCollapsed = useAppSelector(state => state.ui.navigator.collapsedResourceKinds.includes(kind));
  const navigatorResources = useAppSelector(navigatorResourcesSelector);
  const count = useMemo(() => navigatorResources.filter(r => r.kind === kind).length, [navigatorResources]);

  return (
    <Counter selected={isSelected && isCollapsed} onClick={onClick}>
      {count}
    </Counter>
  );
}

export default ResourceCounter;

const Counter = styled.span<{selected: boolean}>`
  margin-left: 8px;
  font-size: 14px;
  cursor: pointer;
  ${props => (props.selected ? `color: ${Colors.blackPure};` : `color: ${FontColors.grey};`)}
`;
