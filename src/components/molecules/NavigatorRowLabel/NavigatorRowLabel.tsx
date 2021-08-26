import React, {useState, useEffect, useContext, useCallback} from 'react';
import {Popover, Typography, Divider} from 'antd';
import styled from 'styled-components';
import Colors, {FontColors} from '@styles/Colors';
import MonoIcon, {MonoIconTypes} from '@components/atoms/MonoIcon';

import AppContext from '@src/AppContext';
import {NAVIGATOR_HEIGHT_OFFSET} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectK8sResource} from '@redux/reducers/main';
import {ResourceRef, K8sResource, ResourceValidationError} from '@models/k8sresource';
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
  showErrorsModal?: (errors: ResourceValidationError[]) => void;
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

const StyledLabelContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StyledIconsContainer = styled.span`
  display: flex;
  align-items: center;
  cursor: pointer;
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
      <MonoIcon type={MonoIconTypes.OutgoingRefs} style={{marginRight: 5}} />
      <StyledRefText>{text}</StyledRefText>
    </div>
  );
};

const IncomingRefLink = (props: RefLinkProps) => {
  const {text, onClick} = props;
  return (
    <div onClick={onClick}>
      <MonoIcon type={MonoIconTypes.IncomingRefs} style={{marginRight: 5}} />
      <StyledRefText>{text}</StyledRefText>
    </div>
  );
};

const UnsatisfiedRefLink = (props: {text: string}) => {
  const {text} = props;
  return (
    <div>
      <MonoIcon type={MonoIconTypes.Warning} style={{marginRight: 5}} />
      <StyledUnsatisfiedRefText>{text}</StyledUnsatisfiedRefText>
    </div>
  );
};

const RefLink = (props: {resourceRef: ResourceRef; resourceMap: ResourceMapType; onClick?: () => void}) => {
  const {resourceRef, resourceMap, onClick} = props;

  const targetName =
    resourceRef.targetResourceId && resourceMap[resourceRef.targetResourceId]
      ? resourceMap[resourceRef.targetResourceId].name
      : resourceRef.name;

  let linkText = targetName;

  if (resourceRef.targetResourceKind) {
    linkText = `${resourceRef.targetResourceKind}: ${targetName}`;
  } else if (resourceRef.targetResourceId) {
    const resourceKind = resourceMap[resourceRef.targetResourceId].kind;
    linkText = `${resourceKind}: ${targetName}`;
  }

  if (isOutgoingRef(resourceRef.type)) {
    return <OutgoingRefLink onClick={onClick} text={linkText} />;
  }
  if (isIncomingRef(resourceRef.type)) {
    return <IncomingRefLink onClick={onClick} text={linkText} />;
  }
  if (isUnsatisfiedRef(resourceRef.type)) {
    return <UnsatisfiedRefLink text={linkText} />;
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
    if (ref.targetResourceId) {
      selectResource(ref.targetResourceId);
    }
  };

  return (
    <>
      <PopoverTitle>{children}</PopoverTitle>
      <StyledDivider />
      {resourceRefs
        .sort((a, b) => {
          let kindA;
          let kindB;
          if (a.targetResourceKind) {
            kindA = a.targetResourceKind;
          } else if (a.targetResourceId) {
            const targetResourceA = resourceMap[a.targetResourceId];
            kindA = targetResourceA?.kind;
          }
          if (b.targetResourceKind) {
            kindB = b.targetResourceKind;
          } else if (b.targetResourceId) {
            const targetResourceB = resourceMap[b.targetResourceId];
            kindB = targetResourceB?.kind;
          }
          if (kindA && kindB) {
            return kindA.localeCompare(kindB);
          }
          return 0;
        })
        .map(resourceRef => (
          <StyledRefDiv key={resourceRef.targetResourceId || resourceRef.name}>
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
    showErrorsModal,
  } = props;

  const dispatch = useAppDispatch();
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
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

  const onClickErrorIcon = () => {
    if (showErrorsModal && resource?.validation?.errors && resource.validation.errors.length > 0) {
      showErrorsModal(resource.validation.errors);
    }
  };

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
    if (isSelected && selectedResourceId && !isVisible) {
      // @ts-ignore
      scrollContainer.current?.scrollIntoView();
    }
  }, []);

  useEffect(() => {
    const isVisible = isScrolledIntoView();
    if (isSelected && selectedResourceId && !isVisible) {
      // @ts-ignore
      scrollContainer.current?.scrollIntoView();
    }
  }, [isSelected, selectedResourceId]);

  const selectResource = (resId: string) => {
    dispatch(selectK8sResource({resourceId: resId}));
  };

  if (!resource) {
    return null;
  }

  return (
    <StyledLabelContainer>
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
          <StyledIconsContainer>
            <MonoIcon type={MonoIconTypes.IncomingRefs} style={{marginRight: 5}} />
          </StyledIconsContainer>
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
          <StyledIconsContainer>
            <MonoIcon type={MonoIconTypes.OutgoingRefs} style={{marginLeft: 5}} />
            {hasUnsatisfiedRefs && <MonoIcon type={MonoIconTypes.Warning} style={{marginLeft: 5}} />}
          </StyledIconsContainer>
        </Popover>
      )}
      {resource && resource.validation && !resource.validation.isValid && (
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
            <MonoIcon type={MonoIconTypes.Error} style={{marginLeft: 5, color: Colors.redError}} />
          </StyledIconsContainer>
        </Popover>
      )}
    </StyledLabelContainer>
  );
};

export default NavigatorRowLabel;
