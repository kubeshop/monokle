import React, {useMemo} from 'react';

import {Dropdown, Menu} from 'antd';

import {sortBy} from 'lodash';
import styled from 'styled-components';

import {PREVIEW_PREFIX} from '@constants/constants';

import {ResourceRefType} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectK8sResource} from '@redux/reducers/main';
import {isInPreviewModeSelector} from '@redux/selectors';

import {Icon} from '@atoms';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

import Colors from '@styles/Colors';

const Container = styled.span`
  width: 100%;
  white-space: nowrap;
`;

const WarningContainer = styled.span`
  margin-left: 10px;
  color: ${Colors.yellowWarning};
  cursor: pointer;
`;

const ErrorContainer = styled.span`
  margin-left: 10px;
  color: ${Colors.redError};
  cursor: pointer;
`;

const Label = styled.span`
  margin-left: 3px;
`;

const StyledMenu = styled(Menu)`
  max-height: 400px;
  overflow-y: scroll;
  ${GlobalScrollbarStyle}
  padding: 4px 0;
`;

const StyledMenuItem = styled(Menu.Item)`
  margin-bottom: 0 !important;
  margin-top: 0 !important;
  height: 28px !important;
  line-height: 28px !important;
  padding: 0 4px;
`;

type Warning = {
  id: string;
  type: string;
  name: string;
  count: number;
};

type RefDropdownMenuProps = {
  warnings: Warning[];
};

const RefDropdownMenu = (props: RefDropdownMenuProps) => {
  const dispatch = useAppDispatch();
  const {warnings} = props;
  return (
    <StyledMenu>
      {warnings.map(warning => (
        <StyledMenuItem key={warning.id} onClick={() => dispatch(selectK8sResource({resourceId: warning.id}))}>
          <Label>{warning.type}:</Label>
          <Label>&nbsp;{warning.name}</Label>
          <Label>&nbsp;({warning.count})</Label>
        </StyledMenuItem>
      ))}
    </StyledMenu>
  );
};

function WarningsAndErrorsDisplay() {
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);

  const warnings: any[] = useMemo(() => {
    const warningsCollection = Object.values(resourceMap)
      .filter(resource =>
        isInPreviewMode ? resource.filePath.startsWith(PREVIEW_PREFIX) : !resource.filePath.startsWith(PREVIEW_PREFIX)
      )
      .map(resource => {
        if (resource.refs) {
          const unsatisfiedRefs = resource.refs.filter(ref => ref.type === ResourceRefType.Unsatisfied);
          if (unsatisfiedRefs.length > 0) {
            return {
              id: resource.id,
              type: resource.kind,
              name: resource.name,
              count: unsatisfiedRefs.length,
            };
          }
          return null;
        }
        return null;
      })
      .filter(warning => warning);
    return sortBy(warningsCollection, ['type', 'name']);
  }, [resourceMap, isInPreviewMode]);

  const errors: any[] = useMemo(() => {
    return Object.values(resourceMap)
      .filter(resource =>
        isInPreviewMode ? resource.filePath.startsWith(PREVIEW_PREFIX) : !resource.filePath.startsWith(PREVIEW_PREFIX)
      )
      .map(resource => {
        if (resource.validation && !resource.validation.isValid) {
          return {
            id: resource.id,
            type: resource.kind,
            name: resource.name,
            count: resource.validation.errors.length,
          };
        }
        return null;
      })
      .filter(error => error);
  }, [resourceMap, isInPreviewMode]);

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
        <Dropdown overlay={<RefDropdownMenu warnings={warnings} />} trigger={['click']} placement="bottomCenter">
          <WarningContainer>
            <Icon name="warning" />
            <Label>{warningsCount}</Label>
          </WarningContainer>
        </Dropdown>
      )}
      {errorsCount > 0 && (
        <Dropdown overlay={<RefDropdownMenu warnings={errors} />} trigger={['click']} placement="bottomCenter">
          <ErrorContainer>
            <Icon name="error" />
            <Label>{errorsCount}</Label>
          </ErrorContainer>
        </Dropdown>
      )}
    </Container>
  );
}

export default WarningsAndErrorsDisplay;
