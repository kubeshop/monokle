import MonoIcon, {MonoIconTypes} from '@components/atoms/MonoIcon';
import {K8sResource} from '@models/k8sresource';
import {NavSectionItemCustomComponentProps} from '@models/navsection';
import {useAppDispatch} from '@redux/hooks';
import Colors from '@styles/Colors';
import {Popover} from 'antd';
import styled from 'styled-components';
import {showValidationErrorsModal} from '@redux/reducers/ui';
import ResourceRefsIconPopover from '@components/molecules/ResourceRefsIconPopover';

const StyledIconsContainer = styled.span`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const Suffix = (props: NavSectionItemCustomComponentProps<K8sResource>) => {
  const {item} = props;
  const dispatch = useAppDispatch();

  const onClickErrorIcon = () => {
    if (item.validation) {
      dispatch(showValidationErrorsModal(item.validation.errors));
    }
  };

  return (
    <>
      <ResourceRefsIconPopover resource={item} type="outgoing" />
      {item.validation && !item.validation.isValid && (
        <Popover
          placement="right"
          content={
            <div>
              <span>
                {item.validation.errors.length} error{item.validation.errors.length !== 1 && 's'}
              </span>
            </div>
          }
        >
          <StyledIconsContainer onClick={onClickErrorIcon}>
            <MonoIcon type={MonoIconTypes.Error} style={{marginLeft: 5, color: Colors.redError}} />
          </StyledIconsContainer>
        </Popover>
      )}
    </>
  );
};

export default Suffix;
