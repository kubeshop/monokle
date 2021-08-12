import React, {useState, useEffect, useContext, useCallback} from 'react';
import {Popover, Typography, Divider} from 'antd';
import styled from 'styled-components';
import Colors, {FontColors} from '@styles/Colors';
import MonoIcon, {MonoIconTypes} from '@components/atoms/MonoIcon';

import AppContext from '@src/AppContext';
import {NAVIGATOR_HEIGHT_OFFSET} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectK8sResource} from '@redux/reducers/main';
import {ResourceRef, K8sResource} from '@models/k8sresource';
import {ResourceMapType} from '@models/appstate';
import {isOutgoingRef, isIncomingRef, isUnsatisfiedRef} from '@redux/services/resourceRefs';
import ScrollIntoView from '@molecules/ScrollIntoView';

const {Text} = Typography;

type RefLinkProps = {
  text: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
};

type NavigatorRowLabelProps = {
  label: string;
  resourceId: string;
  isSelected: boolean;
  isHighlighted: boolean;
  hasIncomingRefs: boolean;
  hasOutgoingRefs: boolean;
  hasUnsatisfiedRefs?: boolean;
  onClickLabel?: React.MouseEventHandler<HTMLDivElement>;
};

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

const StyledRefText = styled(Text)`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const StyledSpan = styled.span<{isSelected: boolean; isHighlighted: boolean}>`
  cursor: pointer;
  ${props => {
    if (props.isSelected) {
      return `color: ${Colors.blackPure}`;
    }
    if (props.isHighlighted) {
      return `color: ${Colors.cyan7}`;
    }
    return `color: ${Colors.blue10}`;
  }}
`;

const OutgoingRefLink = (props: RefLinkProps) => {
  const {text, onClick} = props;
  return (
    <div onClick={onClick}>
      <MonoIcon type={MonoIconTypes.OutgoingRefs} marginRight={5} />
      <StyledRefText>{text}</StyledRefText>
    </div>
  );
};

const IncomingRefLink = (props: RefLinkProps) => {
  const {text, onClick} = props;
  return (
    <div onClick={onClick}>
      <MonoIcon type={MonoIconTypes.IncomingRefs} marginRight={5} />
      <StyledRefText>{text}</StyledRefText>
    </div>
  );
};

const UnsatisfiedRefLink = (props: {text: string}) => {
  const {text} = props;
  return (
    <div>
      <MonoIcon type={MonoIconTypes.Warning} marginRight={5} />
      <StyledUnsatisfiedRefText>{text}</StyledUnsatisfiedRefText>
    </div>
  );
};

const RefLink = (props: {resourceRef: ResourceRef; resourceMap: ResourceMapType; onClick?: () => void}) => {
  const {resourceRef, resourceMap, onClick} = props;

  const targetName =
    resourceRef.targetResource && resourceMap[resourceRef.targetResource]
      ? resourceMap[resourceRef.targetResource].name
      : resourceRef.name;

  let linkText = targetName;

  if (resourceRef.targetResource) {
    const resourceKind = resourceMap[resourceRef.targetResource].kind;
    linkText = `${resourceKind}: ${targetName}`;
  }

  if (isOutgoingRef(resourceRef.type)) {
    return <OutgoingRefLink onClick={onClick} text={linkText} />;
  }
  if (isIncomingRef(resourceRef.type)) {
    return <IncomingRefLink onClick={onClick} text={linkText} />;
  }
  if (isUnsatisfiedRef(resourceRef.type)) {
    return <UnsatisfiedRefLink text={targetName} />;
  }

  return null;
};

const PopoverContent = (props: {
  children: React.ReactNode;
  resourceRefs: ResourceRef[];
  resourceMap: ResourceMapType;
  selectResource: (selectedResource: string) => void;
}) => {
  const {children, resourceRefs, resourceMap, selectResource} = props;

  const onLinkClick = (ref: ResourceRef) => {
    if (ref.targetResource) {
      selectResource(ref.targetResource);
    }
  };

  return (
    <>
      <PopoverTitle>{children}</PopoverTitle>
      <StyledDivider />
      {resourceRefs
        .sort((a, b) => {
          if (a.targetResource && b.targetResource) {
            const resourceA = resourceMap[a.targetResource];
            const resourceB = resourceMap[b.targetResource];
            return resourceA.kind.localeCompare(resourceB.kind);
          }
          return 0;
        })
        .map(resourceRef => (
          <StyledRefDiv key={resourceRef.targetResource || resourceRef.name}>
            <RefLink resourceRef={resourceRef} resourceMap={resourceMap} onClick={() => onLinkClick(resourceRef)} />
          </StyledRefDiv>
        ))}
    </>
  );
};

const NavigatorRowLabel = (props: NavigatorRowLabelProps) => {
  const {
    label,
    isSelected,
    isHighlighted,
    resourceId,
    hasIncomingRefs,
    hasOutgoingRefs,
    hasUnsatisfiedRefs,
    onClickLabel,
  } = props;

  const dispatch = useAppDispatch();
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedResource = useAppSelector(state => state.main.selectedResource);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const [resource, setResource] = useState<K8sResource>();
  const scrollContainer = React.useRef(null);
  const labelRef = React.useRef<HTMLSpanElement>(null);

  const {windowSize} = useContext(AppContext);
  const navigatorHeight = windowSize.height - NAVIGATOR_HEIGHT_OFFSET;

  const isScrolledIntoView = useCallback(() => {
    const boundingClientRect = labelRef.current?.getBoundingClientRect();
    if (!boundingClientRect) {
      return false;
    }
    const elementTop = boundingClientRect.top;
    const elementBottom = boundingClientRect.bottom;
    return elementTop < navigatorHeight && elementBottom >= 0;
  }, [navigatorHeight]);

  useEffect(() => {
    setResource(resourceMap[resourceId]);
  }, [resourceId, resourceMap]);

  useEffect(() => {
    const isVisible = isScrolledIntoView();
    if (isHighlighted && selectedPath && !isVisible) {
      // @ts-ignore
      scrollContainer.current?.scrollIntoView();
    }
  }, [isHighlighted, selectedPath]);

  // on mount, if this resource is selected, scroll to it (the subsection expanded and rendered this)
  useEffect(() => {
    const isVisible = isScrolledIntoView();
    if (isSelected && selectedResource && !isVisible) {
      // @ts-ignore
      scrollContainer.current?.scrollIntoView();
    }
  }, []);

  useEffect(() => {
    const isVisible = isScrolledIntoView();
    if (isSelected && selectedResource && !isVisible) {
      // @ts-ignore
      scrollContainer.current?.scrollIntoView();
    }
  }, [isSelected, selectedResource]);

  const selectResource = (resId: string) => {
    dispatch(selectK8sResource(resId));
  };

  return (
    <>
      {resource && resource.refs && hasIncomingRefs && (
        <Popover
          mouseEnterDelay={0.5}
          placement="rightTop"
          content={
            <PopoverContent
              resourceRefs={resource.refs.filter(r => isIncomingRef(r.type))}
              resourceMap={resourceMap}
              selectResource={selectResource}
            >
              Incoming Links <MonoIcon type={MonoIconTypes.IncomingRefs} />
            </PopoverContent>
          }
        >
          <span>
            <MonoIcon type={MonoIconTypes.IncomingRefs} marginRight={5} />
          </span>
        </Popover>
      )}
      <StyledSpan
        isSelected={isSelected}
        isHighlighted={isHighlighted}
        onClick={onClickLabel}
        style={!hasIncomingRefs ? {marginLeft: 19} : {}}
      >
        <ScrollIntoView ref={scrollContainer}>
          <span ref={labelRef}>{label}</span>
        </ScrollIntoView>
      </StyledSpan>
      {resource && resource.refs && (hasOutgoingRefs || hasUnsatisfiedRefs) && (
        <Popover
          placement="rightTop"
          mouseEnterDelay={0.5}
          content={
            <PopoverContent
              resourceRefs={resource.refs.filter(r => isOutgoingRef(r.type) || isUnsatisfiedRef(r.type))}
              resourceMap={resourceMap}
              selectResource={selectResource}
            >
              Outgoing Links <MonoIcon type={MonoIconTypes.OutgoingRefs} />
            </PopoverContent>
          }
        >
          <span>
            <MonoIcon type={MonoIconTypes.OutgoingRefs} marginLeft={5} />
            {hasUnsatisfiedRefs && <MonoIcon type={MonoIconTypes.Warning} marginLeft={5} />}
          </span>
        </Popover>
      )}
    </>
  );
};

export default NavigatorRowLabel;
