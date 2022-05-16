import React from 'react';
import {useWindowSize} from 'react-use';

import {Col, Modal, Row} from 'antd';

import {useAppSelector} from '@redux/hooks';
import {selectCompareStatus, selectDiffedComparison} from '@redux/reducers/compare';

import {CompareActionBar} from './CompareActionBar';
import {CompareModalComparing} from './CompareModalComparing';
import {CompareModalFooter} from './CompareModalFooter';
import {CompareModalSelecting} from './CompareModalSelecting';
import {DiffActionBar} from './DiffActionBar';
import {ResourceSetSelector} from './ResourceSetSelector';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export const DiffModal: React.FC<Props> = ({visible, onClose}) => {
  const sizeProps = useModalSize();
  const status = useAppSelector(state => selectCompareStatus(state.compare));
  const diffComparison = useAppSelector(state => selectDiffedComparison(state.compare));

  return (
    <Modal
      title="Comparing resources"
      visible={visible}
      onCancel={onClose}
      onOk={onClose}
      footer={<CompareModalFooter onClose={onClose} />}
      {...sizeProps}
    >
      {!diffComparison ? <CompareActionBar /> : <DiffActionBar />}

      <div style={{height: 'calc(100% - 66px)', position: 'relative'}}>
        <Row>
          <Col span={11}>
            <ResourceSetSelector side="left" />
          </Col>
          <Col span={2} />
          <Col span={11}>
            <ResourceSetSelector side="right" />
          </Col>
        </Row>

        {status === 'selecting' ? <CompareModalSelecting /> : <CompareModalComparing />}
      </div>
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
