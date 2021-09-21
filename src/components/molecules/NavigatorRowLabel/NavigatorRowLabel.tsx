import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Divider, Dropdown, Popover, Typography} from 'antd';
import styled from 'styled-components';
import {useSelector} from 'react-redux';
import Colors, {FontColors} from '@styles/Colors';
import MonoIcon, {MonoIconTypes} from '@components/atoms/MonoIcon';
import {FormOutlined} from '@ant-design/icons';

import AppContext from '@src/AppContext';
import {NAVIGATOR_HEIGHT_OFFSET} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile, selectK8sResource} from '@redux/reducers/main';
import {K8sResource, ResourceRef, ResourceValidationError} from '@models/k8sresource';
import {ResourceMapType} from '@models/appstate';
import {isIncomingRef, isOutgoingRef, isUnsatisfiedRef} from '@redux/services/resourceRefs';
import {isUnsavedResource} from '@redux/services/resource';
import ScrollIntoView from '@molecules/ScrollIntoView';
import {isInPreviewModeSelector} from '@redux/selectors';
import {isKustomizationResource} from '@redux/services/kustomize';
import path from 'path';
import ActionsMenu from './ActionsMenu';

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

const StyledMenuToggle = styled.span`
  margin-left: auto;
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

const StyledActionsMenuIcon = styled(FormOutlined)`
  font-size: 14px;
  padding: 0 10px;
`;

const StyledLabel = styled.span<{isSelected: boolean; isUnsaved: boolean}>`
  ${props => {
    if (props.isUnsaved && !props.isSelected) {
      return `color: ${Colors.yellow7}`;
    }
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

const getRefTargetName = (ref: ResourceRef, resourceMap: ResourceMapType) => {
  if (ref.target?.type === 'resource') {
    if (ref.target.resourceId && resourceMap[ref.target.resourceId]) {
      return resourceMap[ref.target.resourceId].name;
    }
  }
  if (ref.target?.type === 'file') {
    return path.parse(ref.target.filePath).name;
  }
  return ref.name;
};

const getRefKind = (ref: ResourceRef, resourceMap: ResourceMapType) => {
  if (ref.target?.type === 'file') {
    return 'File';
  }

  if (ref.target?.type === 'resource') {
    if (ref.target.resourceKind) {
      return ref.target.resourceKind;
    }
    if (ref.target.resourceId) {
      return resourceMap[ref.target.resourceId]?.kind;
    }
  }
};

const RefLink = (props: {resourceRef: ResourceRef; resourceMap: ResourceMapType; onClick?: () => void}) => {
  const {resourceRef, resourceMap, onClick} = props;

  const targetName = getRefTargetName(resourceRef, resourceMap);
  let linkText = targetName;

  if (resourceRef.target?.type === 'file') {
    linkText = `File: ${targetName}`;
  } else if (resourceRef.target?.type === 'resource') {
    if (resourceRef.target.resourceKind) {
      linkText = `${resourceRef.target.resourceKind}: ${targetName}`;
    } else if (resourceRef.target.resourceId) {
      const resourceKind = resourceMap[resourceRef.target.resourceId].kind;
      linkText = `${resourceKind}: ${targetName}`;
    }
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
  selectResource: (resourceId: string) => void;
  selectFilePath: (filePath: string) => void;
}) => {
  const {children, resourceRefs, resourceMap, selectResource, selectFilePath} = props;

  const onLinkClick = (ref: ResourceRef) => {
    if (ref.target?.type === 'resource' && ref.target.resourceId) {
      selectResource(ref.target.resourceId);
    }
    if (ref.target?.type === 'file') {
      selectFilePath(ref.target.filePath);
    }
  };

  return (
    <>
      <PopoverTitle>{children}</PopoverTitle>
      <StyledDivider />
      {resourceRefs
        .sort((a, b) => {
          let kindA = getRefKind(a, resourceMap);
          let kindB = getRefKind(b, resourceMap);

          if (kindA && kindB) {
            return kindA.localeCompare(kindB);
          }
          return 0;
        })
        .map(resourceRef => {
          let key = resourceRef.name;
          if (resourceRef.target?.type === 'file') {
            key = resourceRef.target.filePath;
          }
          if (resourceRef.target?.type === 'resource') {
            if (resourceRef.target.resourceId) {
              key = resourceRef.target.resourceId;
            } else {
              key = resourceRef.target.resourceKind
                ? `${resourceRef.target.resourceKind}-${resourceRef.name}`
                : resourceRef.name;
            }
          }
          return (
            <StyledRefDiv key={key}>
              <RefLink resourceRef={resourceRef} resourceMap={resourceMap} onClick={() => onLinkClick(resourceRef)} />
            </StyledRefDiv>
          );
        })}
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
  const fileMap = useAppSelector(state => state.main.fileMap);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const [resource, setResource] = useState<K8sResource>();
  const scrollContainer = React.useRef(null);
  const labelRef = React.useRef<HTMLSpanElement>(null);
  const isInPreviewMode = useSelector(isInPreviewModeSelector);
  const previewType = useAppSelector(state => state.main.previewType);
  const [isHovered, setHovered] = useState<boolean>(false);

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
  }, [isHighlighted, selectedPath, isScrolledIntoView]);

  // on mount, if this resource is selected, scroll to it (the subsection expanded and rendered this)
  useEffect(() => {
    const isVisible = isScrolledIntoView();
    if (isSelected && selectedResourceId && !isVisible) {
      // @ts-ignore
      scrollContainer.current?.scrollIntoView();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const isVisible = isScrolledIntoView();
    if (isSelected && selectedResourceId && !isVisible) {
      // @ts-ignore
      scrollContainer.current?.scrollIntoView();
    }
  }, [isSelected, selectedResourceId, isScrolledIntoView]);

  const isUnsaved = useCallback(() => {
    return Boolean(resource && isUnsavedResource(resource));
  }, [resource]);

  const selectResource = (selectedId: string) => {
    if (resourceMap[selectedId]) {
      dispatch(selectK8sResource({resourceId: selectedId}));
    }
  };

  const selectFilePath = (filePath: string) => {
    if (fileMap[filePath]) {
      dispatch(selectFile({filePath}));
    }
  };

  if (!resource) {
    return null;
  }

  return (
    <StyledLabelContainer onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {resource && resource.refs && hasIncomingRefs && (
        <Popover
          mouseEnterDelay={0.5}
          placement="rightTop"
          content={
            <PopoverContent
              resourceRefs={resource.refs.filter(r => isIncomingRef(r.type))}
              resourceMap={resourceMap}
              selectResource={selectResource}
              selectFilePath={selectFilePath}
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
          <StyledLabel isSelected={isSelected} isUnsaved={isUnsaved()} ref={labelRef}>
            {label}
            {isUnsaved() && <span>*</span>}
          </StyledLabel>
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
              selectFilePath={selectFilePath}
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
      {!isKustomizationResource(resource) && isHovered && (
        <StyledMenuToggle>
          <Dropdown
            overlay={
              <ActionsMenu
                resource={resource}
                resourceMap={resourceMap}
                isInPreviewMode={isInPreviewMode}
                previewType={previewType}
              />
            }
            trigger={['click']}
          >
            <StyledActionsMenuIcon />
          </Dropdown>
        </StyledMenuToggle>
      )}
    </StyledLabelContainer>
  );
};

export default NavigatorRowLabel;
