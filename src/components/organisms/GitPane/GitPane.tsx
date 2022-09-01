import React, {useState} from 'react';

import {Button, Checkbox, List, Menu} from 'antd';

import {FileOutlined} from '@ant-design/icons';

import {ContextMenu, TitleBar} from '@molecules';

import {Dots} from '@components/atoms';

import * as S from './GitPane.styled';

const data = [
  {
    id: '1',
    name: 'argo-rollouts',
    path: '/path/secondpath',
  },
  {
    id: '2',
    name: 'argo-rollouts-deployment',
    path: '/path/deployment',
  },
  {
    id: '3',
    name: 'argo-rollouts',
    path: '/path',
  },
];

const GitPane: React.FC<{height: number}> = ({height}) => {
  const [list, setList] = useState(data);
  const [selected, setSelected] = useState([]);
  const [hovered, setHovered] = useState({});

  const handleEnter = item => {
    setHovered(item);
  };

  const handleLeave = () => {
    setHovered({});
  };

  const handleSelect = (event, item) => {
    let newSelected;
    if (event.target.checked) {
      newSelected = [...selected];
      newSelected.push(item);
      setSelected(newSelected);
    } else {
      newSelected = selected.filter(elem => elem.id !== item.id);
      setSelected(newSelected);
    }
  };

  const handleSelectAll = () => {
    if (selected.length > 0) {
      setSelected([]);
    } else {
      setSelected(list);
    }
  };

  const menuItems = [
    {
      key: 'commit_to_new',
      label: 'Commit to a new branch & PR',
      onClick: () => {},
    },
    {
      key: 'commit_to_main',
      label: 'Commit to the main branch & PR',
      onClick: () => {},
    },
    {
      key: 'diff',
      label: 'Diff',
      onClick: () => {},
    },
    {
      key: 'rollback',
      label: 'Rollback',
      onClick: () => {},
    },
  ];

  return (
    <S.GitPaneContainer id="GitPane" style={{height}}>
      <TitleBar title="Commit" closable />
      <S.Files>
        <S.FileList>
          <Checkbox onChange={handleSelectAll}>
            <S.ChangeList>
              Changelist <S.ChangeListStatus>{data.length} files</S.ChangeListStatus>
            </S.ChangeList>
          </Checkbox>
          <List
            dataSource={list}
            renderItem={item => {
              return (
                <List.Item
                  onMouseEnter={() => handleEnter(item)}
                  onMouseLeave={handleLeave}
                  style={{justifyContent: 'flex-start'}}
                >
                  <S.SelectAll>
                    <Checkbox
                      onChange={e => handleSelect(e, item)}
                      checked={selected.find(searchItem => searchItem.id === item.id)}
                    />
                  </S.SelectAll>
                  <S.FileItem>
                    <S.FileItemData>
                      <S.FileIcon>
                        <FileOutlined />
                      </S.FileIcon>
                      {item.name}
                      <S.FilePath>{item.path}</S.FilePath>
                    </S.FileItemData>
                    {hovered.id === item.id && (
                      <ContextMenu overlay={<Menu items={menuItems} />}>
                        <Dots />
                      </ContextMenu>
                    )}
                  </S.FileItem>
                </List.Item>
              );
            }}
          />
        </S.FileList>

        <S.FilesAction>
          {selected.length > 0 && (
            <Button
              onClick={() => {
                setSelected([]);
                setList([]);
              }}
            >
              Commit to a new branch & PR
            </Button>
          )}
        </S.FilesAction>
      </S.Files>
    </S.GitPaneContainer>
  );
};

export default GitPane;
