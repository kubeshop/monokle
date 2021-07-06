import * as React from 'react';
import {Button, Modal} from 'antd';
import {MonacoDiffEditor} from 'react-monaco-editor';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {useEffect, useState} from 'react';
import {stringify} from 'yaml';
import {diffResource} from '@redux/reducers/thunks';

const DiffModal = () => {
  const dispatch = useAppDispatch();

  const diffContent = useAppSelector(state => state.main.diffContent);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const diffResourceId = useAppSelector(state => state.main.diffResource);

  const [isVisible, setVisible] = useState(false);

  const resourceContent = diffResourceId && resourceMap ? stringify(resourceMap[diffResourceId].content, {sortMapEntries: true}) : '';
  const options = {
    renderSideBySide: true,
  };

  useEffect(() => {
    setVisible(Boolean(diffResource) && Boolean(resourceMap) && Boolean(diffContent));
  }, [diffContent]);

  const handleOk = () => {
    dispatch(diffResource(''));
  };

  return (
    <Modal title='Resource Diff'
           visible={isVisible}
           centered
           width={1000}
           footer={[
             <Button key='submit' type='primary' onClick={handleOk}>OK</Button>,
           ]}>
      <MonacoDiffEditor
        width='1000'
        height='600'
        language='yaml'
        original={resourceContent}
        value={diffContent}
        options={options}
      />
    </Modal>);
};

export default DiffModal;
