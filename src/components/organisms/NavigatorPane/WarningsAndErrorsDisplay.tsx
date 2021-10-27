import React, {useMemo} from 'react';
import styled from 'styled-components';
import MonoIcon, {MonoIconTypes} from '@components/atoms/MonoIcon';
import {useAppSelector} from '@redux/hooks';
import {ResourceRefType} from '@models/k8sresource';
import Colors from '@styles/Colors';

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

  const warningsCount = useMemo(() => {
    return Object.values(resourceMap).reduce<number>((acc, resource) => {
      return acc + (resource.refs ? resource.refs.filter(ref => ref.type === ResourceRefType.Unsatisfied).length : 0);
    }, 0);
  }, [resourceMap]);

  const errorsCount = useMemo(() => {
    return Object.values(resourceMap).reduce<number>((acc, resource) => {
      return acc + (resource.validation && !resource.validation.isValid ? resource.validation.errors.length : 0);
    }, 0);
  }, [resourceMap]);

  return (
    <Container>
      {warningsCount > 0 && (
        <WarningContainer>
          <MonoIcon type={MonoIconTypes.Warning} />
          <Label>{warningsCount}</Label>
        </WarningContainer>
      )}
      {errorsCount && (
        <ErrorContainer>
          <MonoIcon type={MonoIconTypes.Error} />
          <Label>{errorsCount}</Label>
        </ErrorContainer>
      )}
    </Container>
  );
}

export default WarningsAndErrorsDisplay;
