import {Popover} from 'antd';

import styled from 'styled-components';

import {ItemCustomComponentProps} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {showValidationErrorsModal} from '@redux/reducers/ui';

import {Icon} from '@atoms';

import ResourceRefsIconPopover from '@components/molecules/ResourceRefsIconPopover';

import Colors from '@styles/Colors';

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

  const onClickErrorIcon = () => {
    if (resource.validation) {
      dispatch(showValidationErrorsModal(resource.validation.errors));
    }
  };

  return (
    <>
      <ResourceRefsIconPopover
        isSelected={itemInstance.isSelected}
        isDisabled={itemInstance.isDisabled}
        resource={resource}
        type="outgoing"
      />
      {resource.validation && !resource.validation.isValid && (
        <Popover
          placement="right"
          content={
            <div>
              <span>
                {resource.validation.errors.length} error{resource.validation.errors.length !== 1 && 's'}
              </span>
            </div>
          }
        >
          <StyledIconsContainer onClick={onClickErrorIcon}>
            <Icon
              name="error"
              style={{marginLeft: 5}}
              color={itemInstance.isSelected ? Colors.blackPure : Colors.redError}
            />
          </StyledIconsContainer>
        </Popover>
      )}
    </>
  );
};

export default Suffix;
