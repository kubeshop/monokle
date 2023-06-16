import {useCallback, useRef, useState} from 'react';

import {Modal, Select, TreeSelect} from 'antd';

import path from 'path';
import styled from 'styled-components';

import {useAppDispatch} from '@redux/hooks';
import {saveTransientResources} from '@redux/thunks/saveTransientResources';

import {useFileFolderTreeSelectData} from '@hooks/useFolderTreeSelectData';

import {useRefSelector, useStateWithRef} from '@utils/hooks';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {K8sResource} from '@shared/models/k8sResource';

type Props = {
  resources: K8sResource[];
  isVisible: boolean;
  onClose: () => void;
};

const SaveToFolderModal: React.FC<Props> = props => {
  const {isVisible, onClose, resources} = props;
  const dispatch = useAppDispatch();
  const [selectedFolder, setSelectedFolder, selectedFolderRef] = useStateWithRef<string | undefined>(ROOT_FILE_ENTRY);
  const [isLoading, setIsLoading] = useState(false);
  const folderTreeData = useFileFolderTreeSelectData('folder');
  const rootFolderPathRef = useRefSelector(state => state.main.fileMap[ROOT_FILE_ENTRY]?.filePath);

  const resourcesRef = useRef(resources);
  resourcesRef.current = resources;

  const handleSave = useCallback(async () => {
    if (!selectedFolderRef.current) {
      return;
    }
    const folder =
      selectedFolderRef.current === ROOT_FILE_ENTRY
        ? rootFolderPathRef.current
        : path.join(rootFolderPathRef.current, selectedFolderRef.current);
    setIsLoading(true);
    const pendingSave = dispatch(
      saveTransientResources({
        resourcePayloads: resourcesRef.current.map(resource => {
          return {
            resource,
            absolutePath: path.join(folder, `${resource.name}-${resource.kind.toLowerCase()}.yaml`),
          };
        }),
        saveMode: 'saveToFolder',
      })
    ).unwrap();
    await pendingSave;
    setIsLoading(false);
    onClose();
  }, [onClose, dispatch, selectedFolderRef, rootFolderPathRef]);

  return (
    <Modal open={isVisible} onCancel={onClose} onOk={handleSave} confirmLoading={isLoading}>
      <StyledLabel>Select folder</StyledLabel>
      <TreeSelect
        treeDefaultExpandedKeys={['<root>']}
        dropdownMatchSelectWidth={false}
        value={selectedFolder}
        onChange={value => setSelectedFolder(value)}
        showSearch
        treeDefaultExpandAll
        treeData={[folderTreeData]}
        treeNodeLabelProp="label"
        style={{width: '80%'}}
      />
    </Modal>
  );
};

export default SaveToFolderModal;

export const StyledSelect = styled(Select)`
  flex: 1;
  overflow-x: hidden;
`;

export const StyledLabel = styled.div`
  margin-bottom: 8px;
  font-weight: 600;
`;
