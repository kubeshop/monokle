import React from 'react';
import {useMeasure, useWindowSize} from 'react-use';

import {Col, Modal, Row} from 'antd';

import {useAppSelector} from '@redux/hooks';
import {selectCompareStatus} from '@redux/reducers/compare';

import {CompareActionBar} from './CompareActionBar';
import {CompareModalComparing} from './CompareModalComparing';
import {CompareModalFooter} from './CompareModalFooter';
import {CompareModalSelecting} from './CompareModalSelecting';
import {InspectionActionBar} from './InspectionActionBar';
import {ResourceSetSelector} from './ResourceSetSelector';
import {TransferButton} from './TransferButton';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export const DiffModal: React.FC<Props> = ({visible, onClose}) => {
  const sizeProps = useModalSize();
  const status = useAppSelector(state => selectCompareStatus(state.compare));
  const isInspecting = useAppSelector(state => state.compare.current.inspect);
  const [containerRef, {height}] = useMeasure<HTMLDivElement>();

  return (
    <Modal
      title="Comparing resources"
      visible={visible}
      onCancel={onClose}
      onOk={onClose}
      footer={<CompareModalFooter onClose={onClose} />}
      {...sizeProps}
    >
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

      <div
        style={{
          height: `calc(100% - ${height}px - 66px - 66px)`,
          marginRight: '-8px',
          position: 'relative',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {status === 'selecting' ? <CompareModalSelecting /> : <CompareModalComparing />}
      </div>

      <Row style={{height: 66, alignItems: 'center'}}>
        <Col span={10}>
          <TransferButton side="left" />
        </Col>
        <Col span={4} />
        <Col span={10}>
          <TransferButton side="right" />
        </Col>
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
  const percentage = 0.85;

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

export default DiffModal;
