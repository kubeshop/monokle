import React from 'react';
import {useMeasure, useWindowSize} from 'react-use';

import {Col, Modal, Row} from 'antd';

import {selectCompareStatus} from '@redux/compare';
import {useAppSelector} from '@redux/hooks';

import {CompareActionBar} from './CompareActionBar';
import * as S from './CompareModal.styled';
import {CompareModalComparing} from './CompareModalComparing';
import {CompareModalSelecting} from './CompareModalSelecting';
import {InspectionActionBar} from './InspectionActionBar';
import {ResourceSetSelector} from './ResourceSetSelector';
import {TransferButton} from './TransferButton';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export const CompareModal: React.FC<Props> = ({visible, onClose}) => {
  const sizeProps = useModalSize();
  const status = useAppSelector(state => selectCompareStatus(state.compare));
  const isInspecting = useAppSelector(state => state.compare.current.inspect);
  const [containerRef, {height}] = useMeasure<HTMLDivElement>();

  return (
    <Modal footer={null} title="Comparing resources" visible={visible} onCancel={onClose} onOk={onClose} {...sizeProps}>
      {!isInspecting ? <CompareActionBar /> : <InspectionActionBar />}

      <Row ref={containerRef}>
        <Col span={10}>
          <ResourceSetSelector side="left" />
        </Col>
        <Col span={4} />
        <Col span={10}>
          <ResourceSetSelector side="right" />
        </Col>
      </Row>

      <S.ContentDiv style={{height: `calc(100% - ${height}px - 66px - 45px)`}}>
        {status === 'selecting' ? <CompareModalSelecting /> : <CompareModalComparing />}
      </S.ContentDiv>

      <S.ActionsRow>
        <Col span={10}>
          <TransferButton side="left" />
        </Col>
        <Col span={4} />
        <Col span={10}>
          <TransferButton side="right" />
        </Col>
      </S.ActionsRow>
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

export default CompareModal;
