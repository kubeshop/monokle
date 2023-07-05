import {useEffect, useState} from 'react';

import {TreeSelect} from 'antd';

import {basename, dirname, sep} from 'path';
import invariant from 'tiny-invariant';

import {resourceSetSelected, selectGitResourceSet} from '@redux/compare';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {createRootFileEntry} from '@redux/services/fileEntry';

import {useFileFolderTreeSelectData} from '@hooks/useFolderTreeSelectData';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {FileMapType} from '@shared/models/appState';
import {CompareSide, PartialResourceSet} from '@shared/models/compare';
import {K8sResource} from '@shared/models/k8sResource';

import * as S from '../ResourceSetSelectColor.styled';

type IProps = {
  side: CompareSide;
};

const GitFolderSelect: React.FC<IProps> = ({side}) => {
  const dispatch = useAppDispatch();
  const resourceSet = useAppSelector(state => selectGitResourceSet(state, side));
  // TODO: can we avoid this type cast?
  const resources = useAppSelector(state => state.compare.current[side]?.resources) as
    | K8sResource<'local'>[]
    | undefined;
  invariant(resourceSet, 'invalid_state');

  const [gitFileMap, setGitFileMap] = useState<FileMapType>();
  const treeData = useFileFolderTreeSelectData('folder', gitFileMap);

  const {currentGitBranch, currentCommit, currentFolder} = resourceSet;

  const handleSelect = (folder: string) => {
    const value: PartialResourceSet = {
      type: 'git',
      branchName: currentGitBranch?.name,
      commitHash: currentCommit?.hash,
      folder,
    };
    dispatch(resourceSetSelected({side, value}));
  };

  useEffect(() => {
    if (!resources || currentFolder !== '<root>') {
      return;
    }

    setGitFileMap(generateGitFileMap(resources));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources]);

  return (
    <S.SelectColor>
      <TreeSelect
        value={currentFolder}
        treeDefaultExpandedKeys={['<root>']}
        dropdownMatchSelectWidth={false}
        onChange={handleSelect}
        placeholder="Choose Folder..."
        style={{width: 180}}
        treeData={[treeData]}
      />
    </S.SelectColor>
  );
};

export default GitFolderSelect;

const generateGitFileMap = (resources: K8sResource<'local'>[]) => {
  const fileMap: FileMapType = {};
  createRootFileEntry('', fileMap);
  fileMap[ROOT_FILE_ENTRY].children = [];
  const filePaths = resources.map(r => `${sep}${r.origin.filePath.replaceAll('/', sep)}`);
  const folderPaths = [...new Set(filePaths.map(filePath => dirname(filePath)))].filter(
    folderPath => folderPath !== sep
  );

  folderPaths.forEach(folderPath => {
    if (folderPath.split(sep).length === 2) {
      fileMap[ROOT_FILE_ENTRY].children?.push(folderPath);
    }
  });

  folderPaths.forEach(folderPath => {
    const subfolders = folderPaths.filter(key => dirname(key) === folderPath);
    fileMap[folderPath] = {
      rootFolderPath: fileMap[ROOT_FILE_ENTRY].filePath,
      children: subfolders,
      filePath: folderPath,
      name: basename(folderPath),
      isExcluded: false,
      extension: '',
    };
  });

  return fileMap;
};
