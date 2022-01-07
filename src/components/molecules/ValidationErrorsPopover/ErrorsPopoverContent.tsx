import React from 'react';

import {Divider, Typography} from 'antd';

import styled from 'styled-components';

import {K8sResource, ResourceValidationError} from '@models/k8sresource';
import {MonacoRange} from '@models/ui';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectK8sResource} from '@redux/reducers/main';
import {setMonacoEditor} from '@redux/reducers/ui';

import ValidationErrorLink from '@molecules/ValidationErrorsPopover/ValidationErrorLink';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

import Colors from '@styles/Colors';

const {Text} = Typography;

const Container = styled.div`
  margin: 0;
  padding: 0 8px;
  height: 100%;
  width: 100%;
  max-height: 350px;
  overflow-y: auto;
  ${GlobalScrollbarStyle}
`;

const PopoverTitle = styled(Text)`
  font-weight: 500;
`;

const StyledDivider = styled(Divider)`
  margin: 5px 0;
`;

const StyledRefDiv = styled.div`
  display: block;
  margin: 5px 0;
`;

const StyledDescription = styled.div`
  display: block;
  width: 600px;
  color: ${Colors.grey7};
`;

const ErrorsPopoverContent = (props: {resource: K8sResource}) => {
  const {resource} = props;
  const dispatch = useAppDispatch();
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);

  const selectResource = (selectedId: string) => {
    if (resourceMap[selectedId]) {
      dispatch(selectK8sResource({resourceId: selectedId}));
    }
  };

  const makeMonacoSelection = (type: 'resource' | 'file', target: string, range: MonacoRange) => {
    const selection =
      type === 'resource'
        ? {
            type,
            resourceId: target,
            range,
          }
        : {type, filePath: target, range};
    dispatch(
      setMonacoEditor({
        selection,
      })
    );
  };

  const onLinkClick = (error: ResourceValidationError) => {
    if (selectedResourceId !== resource.id) {
      selectResource(resource.id);
    }

    if (error.errorPos) {
      const targetOutgoingRefRange: MonacoRange = {
        endColumn: error.errorPos.column + error.errorPos.length,
        endLineNumber: error.errorPos.line,
        startColumn: error.errorPos.column,
        startLineNumber: error.errorPos.line,
      };

      makeMonacoSelection('resource', resource.id, targetOutgoingRefRange);
    }
  };

  return (
    <Container>
      <PopoverTitle>Schema Validation Errors</PopoverTitle>
      <StyledDivider />
      {resource.validation?.errors.map(error => (
        <StyledRefDiv key={`${error.property}:${error.message}`}>
          <ValidationErrorLink resource={resource} validationError={error} onClick={() => onLinkClick(error)} />
          {error.description && <StyledDescription>{error.description}</StyledDescription>}
        </StyledRefDiv>
      ))}
    </Container>
  );
};

export default ErrorsPopoverContent;
