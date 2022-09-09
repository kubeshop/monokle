import React, {useEffect, useMemo} from 'react';
import {useWindowSize} from 'react-use';

import {Button, Col, Modal, Row} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setLastChangedLine} from '@redux/reducers/main';
import {isKustomizationResource} from '@redux/services/kustomize';
import {getResourceSchema} from '@redux/services/schema';

import {FormEditor, Monaco} from '@components/molecules';

import {getResourceKindHandler} from '@src/kindhandlers';
import {extractFormSchema} from '@src/kindhandlers/common/customObjectKindHandler';

import * as S from './FormEditorModal.styled';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export const FormEditorModal: React.FC<Props> = ({visible, onClose}) => {
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const k8sVersion = useAppSelector(state => state.config.projectConfig?.k8sVersion);
  const userDataDir = useAppSelector(state => state.config.userDataDir);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId) || 0;
  const selectedResource = resourceMap[selectedResourceId];
  const sizeProps = useModalSize();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setLastChangedLine(0));
  }, [dispatch]);

  const isKustomization = useMemo(() => isKustomizationResource(selectedResource), [selectedResource]);
  const resourceKindHandler = useMemo(
    () => (selectedResource && !isKustomization ? getResourceKindHandler(selectedResource.kind) : undefined),
    [isKustomization, selectedResource]
  );

  return (
    <Modal
      footer={
        <Button type="primary" onClick={onClose}>
          Done
        </Button>
      }
      title="Form Editor"
      visible={visible}
      onCancel={onClose}
      onOk={onClose}
      {...sizeProps}
    >
      <Row>
        <Col span={24}>
          <S.SourceNameBlock>
            <S.FilePath>
              <span>File:</span>
              {selectedResource?.filePath}
            </S.FilePath>
            <S.FileName>
              <span>Resource:</span>
              {selectedResource?.name}
            </S.FileName>
          </S.SourceNameBlock>
        </Col>
      </Row>
      <Row style={{height: '100%', flexFlow: 'nowrap'}}>
        <S.StyledCol span={12} style={{height: 'auto'}}>
          <S.BlockTitle>Source</S.BlockTitle>
          <Monaco applySelection={() => {}} diffSelectedResource={() => {}} />
        </S.StyledCol>
        <Col span={1} />
        <S.StyledCol span={11}>
          <S.BlockTitle>Form</S.BlockTitle>
          {isKustomization && selectedResource ? (
            <FormEditor
              formSchema={extractFormSchema(
                getResourceSchema(selectedResource, String(k8sVersion), String(userDataDir))
              )}
            />
          ) : (
            resourceKindHandler?.formEditorOptions && (
              <FormEditor
                formSchema={resourceKindHandler.formEditorOptions.editorSchema}
                formUiSchema={resourceKindHandler.formEditorOptions.editorUiSchema}
              />
            )
          )}
        </S.StyledCol>
      </Row>
    </Modal>
  );
};

/* * * * * * * * * * * * * *
 * Modal size hook
 * * * * * * * * * * * * * */
type ModalSizeProps = {
  width: number;
  bodyStyle: {height: number};
  style: {top: number};
};

function useModalSize(): ModalSizeProps {
  const windowSize = useWindowSize();
  const modalHeaderHeight = 55;
  const percentage = 0.9;

  return {
    width: windowSize.width * percentage,
    bodyStyle: {
      height: (windowSize.height - modalHeaderHeight) * percentage,
    },
    style: {
      top: 25,
    },
  };
}

export default FormEditorModal;
