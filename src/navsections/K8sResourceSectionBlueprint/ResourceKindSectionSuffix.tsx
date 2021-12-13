import React, {useCallback, useMemo} from 'react';

import {Button} from 'antd';

import {PlusOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {SectionCustomComponentProps} from '@models/navigator';
import {NewResourceWizardInput} from '@models/ui';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openNewResourceWizard} from '@redux/reducers/ui';

import {ResourceKindHandlers, getResourceKindHandler} from '@src/kindhandlers';

const KnownResourceKinds = ResourceKindHandlers.map(kindHandler => kindHandler.kind);

const ButtonContainer = styled.span`
  padding: 0px 8;
  margin-right: 4px;
`;

const ResourceKindSectionSuffix: React.FC<SectionCustomComponentProps> = props => {
  const {sectionInstance} = props;
  const dispatch = useAppDispatch();

  const isFolderOpen = useAppSelector(state => Boolean(state.main.fileMap[ROOT_FILE_ENTRY]));

  const resourceKind = useMemo(() => {
    return sectionInstance.meta?.resourceKind;
  }, [sectionInstance]);

  const createResource = useCallback(() => {
    if (!resourceKind) {
      return;
    }
    const kindHandler = getResourceKindHandler(resourceKind);
    const input: NewResourceWizardInput = {
      kind: resourceKind,
      apiVersion: kindHandler?.clusterApiVersion,
    };
    dispatch(openNewResourceWizard({defaultInput: input}));
  }, [resourceKind, dispatch]);

  if (!resourceKind || !KnownResourceKinds.includes(resourceKind) || !isFolderOpen) {
    return null;
  }
  return (
    <ButtonContainer>
      <Button icon={<PlusOutlined />} type="link" onClick={createResource} size="small" />
    </ButtonContainer>
  );
};

export default ResourceKindSectionSuffix;
