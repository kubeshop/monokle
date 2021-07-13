import React, {useState, useEffect} from 'react';
import {Popover, Typography, Divider} from 'antd';
import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';

import {ResourceRef} from '@models/k8sresource';

import {isOutgoingRef, isIncomingRef, isUnsatisfiedRef} from '@redux/utils/resourceRefs';

import {FontColors} from '@styles/Colors';

import MonoIcon, {MonoIconTypes} from '@components/atoms/MonoIcon';

const {Text} = Typography;

export enum RefsPopoverType {
  Incoming,
  Outgoing,
}

const StyledDivider = styled(Divider)`
  margin: 5px 0;
`;

const PopoverTitle = styled(Text)`
  font-weight: 500;
`;

const StyledRefDiv = styled.div`
  display: block;
  margin: 5px 0;
`;

const StyledUnsatisfiedRefText = styled(Text)`
  color: ${FontColors.warning};
`;

const StyledRefText = styled(Text)``;

const OutgoingRefLink = (props: {text: string}) => {
  const {text} = props;
  return (
    <>
      <MonoIcon type={MonoIconTypes.OutgoingRefs} marginRight={5} />
      <StyledRefText>{text}</StyledRefText>
    </>
  );
};

const IncomingRefLink = (props: {text: string}) => {
  const {text} = props;
  return (
    <>
      <MonoIcon type={MonoIconTypes.IncomingRefs} marginRight={5} />
      <StyledRefText>{text}</StyledRefText>
    </>
  );
};

const UnsatisfiedRefLink = (props: {text: string}) => {
  const {text} = props;
  return (
    <>
      <MonoIcon type={MonoIconTypes.Warning} marginRight={5} />
      <StyledUnsatisfiedRefText>{text}</StyledUnsatisfiedRefText>
    </>
  );
};

type NavigatorRowRefsPopoverProps = {
  resourceId: string;
  type: RefsPopoverType;
};

const NavigatorRowRefsPopover = (props: NavigatorRowRefsPopoverProps) => {
  const {resourceId, type} = props;

  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const [currentRefs, setCurrentRefs] = useState<ResourceRef[]>();
  const [hasUnsatisfiedRefs, setHasUnsatisfiedRefs] = useState<Boolean>(false);

  useEffect(() => {
    const filteredRefs = [];
    const refs = resourceMap[resourceId]?.refs;
    if (refs) {
      for (let i = 0; i < refs.length; i += 1) {
        const ref = refs[i];
        if (type === RefsPopoverType.Incoming) {
          if (isIncomingRef(ref.refType)) {
            filteredRefs.push(ref);
          }
        }
        if (type === RefsPopoverType.Outgoing) {
          if (isOutgoingRef(ref.refType)) {
            filteredRefs.push(ref);
          }
          if (isUnsatisfiedRef(ref.refType)) {
            filteredRefs.push(ref);
            setHasUnsatisfiedRefs(true);
          }
        }
      }
    }
    setCurrentRefs(filteredRefs);
  }, [resourceId, resourceMap, type]);

  const getLinkByRef = (ref: ResourceRef) => {
    const targetName = ref.targetResource ? resourceMap[ref.targetResource]?.name : '';

    if (isOutgoingRef(ref.refType)) {
      return <OutgoingRefLink text={targetName} />;
    }

    if (isIncomingRef(ref.refType)) {
      return <IncomingRefLink text={targetName} />;
    }

    if (isUnsatisfiedRef(ref.refType)) {
      return <UnsatisfiedRefLink text={ref.refName} />;
    }

    return null;
  };

  const PopoverContent = (
    <>
      <PopoverTitle>
        {type === RefsPopoverType.Incoming && (
          <>
            Incoming Links <MonoIcon type={MonoIconTypes.IncomingRefs} />
          </>
        )}
        {type === RefsPopoverType.Outgoing && (
          <>
            Outgoing Links <MonoIcon type={MonoIconTypes.OutgoingRefs} />
          </>
        )}
      </PopoverTitle>
      <StyledDivider />
      {currentRefs?.map(ref => (
        <StyledRefDiv>{getLinkByRef(ref)}</StyledRefDiv>
      ))}
    </>
  );

  if (currentRefs && currentRefs.length > 0) {
    if (type === RefsPopoverType.Incoming) {
      return (
        <Popover placement="rightTop" content={PopoverContent}>
          <span>
            <MonoIcon type={MonoIconTypes.IncomingRefs} marginRight={5} />
          </span>
        </Popover>
      );
    }

    if (type === RefsPopoverType.Outgoing) {
      return (
        <Popover placement="rightTop" content={PopoverContent}>
          <span>
            <MonoIcon type={MonoIconTypes.OutgoingRefs} marginLeft={5} />
            {hasUnsatisfiedRefs && <MonoIcon type={MonoIconTypes.Warning} marginLeft={5} />}
          </span>
        </Popover>
      );
    }
  }

  return null;
};

export default NavigatorRowRefsPopover;
