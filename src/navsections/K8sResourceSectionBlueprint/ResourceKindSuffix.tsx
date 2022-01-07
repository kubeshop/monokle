import styled from 'styled-components';

import {ItemCustomComponentProps} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {ValidationErrorsPopover} from '@molecules';

import ResourceRefsIconPopover from '@components/molecules/ResourceRefsIconPopover';

const StyledIconsContainer = styled.span`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const Suffix = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;
  const dispatch = useAppDispatch();

  const resource = useAppSelector(state => state.main.resourceMap[itemInstance.id]);
  if (!resource) {
    return null;
  }

  return (
    <>
      <ResourceRefsIconPopover
        isSelected={itemInstance.isSelected}
        isDisabled={itemInstance.isDisabled}
        resource={resource}
        type="outgoing"
      />
      <ValidationErrorsPopover
        resource={resource}
        isSelected={itemInstance.isSelected}
        isDisabled={itemInstance.isDisabled}
      />
    </>
  );
};

export default Suffix;
