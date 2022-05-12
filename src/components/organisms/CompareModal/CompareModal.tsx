import React from 'react';
import {useSelector} from 'react-redux';
import {useWindowSize} from 'react-use';

import {Col, Modal, Row} from 'antd';

import {CompareState, selectCompareStatus} from '@redux/reducers/compare';

import {DiffActionBar} from './CompareActionBar';
import {DiffModalFooter} from './CompareModalFooter';
import {CompareModalSelecting} from './CompareModalSelecting';
import {DiffComparisonList} from './ComparisonList';
import {ResourceSetSelector} from './ResourceSetSelector';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export type PartialStore = {
  compare: CompareState;
};

export default function DiffModal({visible, onClose}: Props) {
  const sizeProps = useModalSize();
  const status = useSelector((state: PartialStore) => selectCompareStatus(state.compare));
  const current = useSelector((state: PartialStore) => {
    return state.compare.current;
  });

  return (
    <Modal
      title="Comparing resources"
      visible={visible}
      onCancel={onClose}
      onOk={onClose}
      footer={<DiffModalFooter onClose={onClose} />}
      {...sizeProps}
    >
      <DiffActionBar />

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

        {status === 'selecting' ? (
          <CompareModalSelecting />
        ) : status === 'comparing' ? (
          <Row>
            <Col span={24}>
              <p>comparing..</p>
            </Col>
          </Row>
        ) : (
          <Row>
            <Col span={24}>
              <DiffComparisonList data={current.diff!} />
            </Col>
          </Row>
        )}
      </div>
    </Modal>
  );
}

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
