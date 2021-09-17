import MonoIcon, {MonoIconTypes} from '@components/atoms/MonoIcon';
import ResourceRefsPopover from '@components/molecules/ResourceRefsPopover';
import {K8sResource} from '@models/k8sresource';
import {NavSectionItemCustomComponentProps} from '@models/navsection';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectK8sResource} from '@redux/reducers/main';
import {isIncomingRef} from '@redux/services/resourceRefs';
import {Popover} from 'antd';
import {useMemo} from 'react';
import styled from 'styled-components';

const StyledIconsContainer = styled.span`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const Prefix = (props: NavSectionItemCustomComponentProps<K8sResource>) => {
  const {item} = props;
  const dispatch = useAppDispatch();
  const resourceMap = useAppSelector(state => state.main.resourceMap);

  const incomingRefs = useMemo(() => item.refs?.filter(r => isIncomingRef(r.type)), [item]);

  const selectResource = (resId: string) => {
    dispatch(selectK8sResource({resourceId: resId}));
  };

  if (!incomingRefs || incomingRefs.length === 0) {
    return null;
  }

  return (
    <Popover
      mouseEnterDelay={0.5}
      placement="rightTop"
      content={
        <ResourceRefsPopover resourceRefs={incomingRefs} resourceMap={resourceMap} selectResource={selectResource}>
          Incoming Links <MonoIcon type={MonoIconTypes.IncomingRefs} />
        </ResourceRefsPopover>
      }
    >
      <StyledIconsContainer>
        <MonoIcon type={MonoIconTypes.IncomingRefs} style={{marginRight: 5}} />
      </StyledIconsContainer>
    </Popover>
  );
};

export default Prefix;
