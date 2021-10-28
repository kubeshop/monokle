import React, {useMemo} from 'react';
import styled from 'styled-components';
import MonoIcon, {MonoIconTypes} from '@components/atoms/MonoIcon';
import {useAppSelector} from '@redux/hooks';
import {ResourceRefType} from '@models/k8sresource';
import Colors from '@styles/Colors';
import {isInPreviewModeSelector} from '@redux/selectors';
import {PREVIEW_PREFIX} from '@constants/constants';

const Container = styled.span`
  width: 100%;
`;

const WarningContainer = styled.span`
  margin-left: 10px;
  color: ${Colors.yellowWarning};
`;

const ErrorContainer = styled.span`
  margin-left: 10px;
  color: ${Colors.redError};
`;

const Label = styled.span`
  margin-left: 3px;
`;

function WarningsAndErrorsDisplay() {
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);

  const warningsCount = useMemo(() => {
    return Object.values(resourceMap)
      .filter(resource =>
        isInPreviewMode ? resource.filePath.startsWith(PREVIEW_PREFIX) : !resource.filePath.startsWith(PREVIEW_PREFIX)
      )
      .reduce<number>((acc, resource) => {
        return acc + (resource.refs ? resource.refs.filter(ref => ref.type === ResourceRefType.Unsatisfied).length : 0);
      }, 0);
  }, [resourceMap, isInPreviewMode]);

  const errorsCount = useMemo(() => {
    return Object.values(resourceMap)
      .filter(resource =>
        isInPreviewMode ? resource.filePath.startsWith(PREVIEW_PREFIX) : !resource.filePath.startsWith(PREVIEW_PREFIX)
      )
      .reduce<number>((acc, resource) => {
        return acc + (resource.validation && !resource.validation.isValid ? resource.validation.errors.length : 0);
      }, 0);
  }, [resourceMap, isInPreviewMode]);

  return (
    <Container>
      {warningsCount > 0 && (
        <WarningContainer>
          <MonoIcon type={MonoIconTypes.Warning} />
          <Label>{warningsCount}</Label>
        </WarningContainer>
      )}
      {errorsCount > 0 && (
        <ErrorContainer>
          <MonoIcon type={MonoIconTypes.Error} />
          <Label>{errorsCount}</Label>
        </ErrorContainer>
      )}
    </Container>
  );
}

export default WarningsAndErrorsDisplay;
