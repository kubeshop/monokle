import React, {useCallback, useMemo} from 'react';

import {Button, Tooltip} from 'antd';

import {PlusOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {TOOLTIP_DELAY} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openNewResourceWizard} from '@redux/reducers/ui';
import {isInClusterModeSelector, isInPreviewModeSelectorNew} from '@redux/selectors';

import {getResourceKindHandler} from '@src/kindhandlers';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {SectionCustomComponentProps} from '@shared/models/navigator';
import {NewResourceWizardInput} from '@shared/models/ui';
import {Colors} from '@shared/styles/colors';

const SuffixContainer = styled.span`
  display: inline-block;
`;

const ButtonContainer = styled.span`
  display: flex;
  align-items: center;
  padding: 0 4px;
  margin-right: 2px;
  & .ant-btn-sm {
    height: 20px;
    width: 20px;
  }
`;

const ResourceKindSectionSuffix: React.FC<SectionCustomComponentProps> = props => {
  const {sectionInstance} = props;
  const dispatch = useAppDispatch();

  const isFolderOpen = useAppSelector(state => Boolean(state.main.fileMap[ROOT_FILE_ENTRY]));
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isSectionCollapsed = useAppSelector(state => state.navigator.collapsedSectionIds.includes(sectionInstance.id));

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

  if (!resourceKind || !getResourceKindHandler(resourceKind) || !isFolderOpen) {
    return null;
  }

  return (
    <SuffixContainer>
      <ButtonContainer>
        <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={`Create a new ${resourceKind}`}>
          <Button
            icon={<PlusOutlined />}
            type="link"
            onClick={createResource}
            size="small"
            disabled={isInPreviewMode || isInClusterMode}
            style={{color: sectionInstance.isSelected && isSectionCollapsed ? Colors.blackPure : undefined}}
          />
        </Tooltip>
      </ButtonContainer>
    </SuffixContainer>
  );
};

export default ResourceKindSectionSuffix;
