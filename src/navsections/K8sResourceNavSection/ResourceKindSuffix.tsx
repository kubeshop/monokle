import MonoIcon, {MonoIconTypes} from '@components/atoms/MonoIcon';
import ResourceRefsPopover from '@components/molecules/ResourceRefsPopover';
import {K8sResource} from '@models/k8sresource';
import {NavSectionItemCustomComponentProps} from '@models/navsection';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectK8sResource} from '@redux/reducers/main';
import {isOutgoingRef, isUnsatisfiedRef} from '@redux/services/resourceRefs';
import Colors from '@styles/Colors';
import {Popover} from 'antd';
import {useMemo} from 'react';
import styled from 'styled-components';
import {showValidationErrorsModal} from '@redux/reducers/ui';

const StyledIconsContainer = styled.span`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const Suffix = (props: NavSectionItemCustomComponentProps<K8sResource>) => {
  const {item} = props;
  const dispatch = useAppDispatch();
  const resourceMap = useAppSelector(state => state.main.resourceMap);

  const outgoingRefs = useMemo(() => item.refs?.filter(r => isOutgoingRef(r.type) || isUnsatisfiedRef(r.type)), [item]);
  const hasUnsatisfiedRefs = useMemo(() => outgoingRefs?.some(r => isUnsatisfiedRef(r.type)), [outgoingRefs]);

  const selectResource = (resId: string) => {
    dispatch(selectK8sResource({resourceId: resId}));
  };

  const onClickErrorIcon = () => {
    if (item.validation) {
      dispatch(showValidationErrorsModal(item.validation.errors));
    }
  };

  if (!outgoingRefs || outgoingRefs.length === 0) {
    return null;
  }

  return (
    <>
      <Popover
        mouseEnterDelay={0.5}
        placement="rightTop"
        content={
          <ResourceRefsPopover resourceRefs={outgoingRefs} resourceMap={resourceMap} selectResource={selectResource}>
            Outgoing Links <MonoIcon type={MonoIconTypes.OutgoingRefs} />
          </ResourceRefsPopover>
        }
      >
        <StyledIconsContainer>
          <MonoIcon type={MonoIconTypes.OutgoingRefs} style={{marginLeft: 5}} />
          {hasUnsatisfiedRefs && <MonoIcon type={MonoIconTypes.Warning} style={{marginLeft: 5}} />}
        </StyledIconsContainer>
      </Popover>
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
