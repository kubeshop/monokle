import React, {useState} from 'react';

import {Button, Checkbox, Dropdown, List, Menu, Space} from 'antd';

import {DownOutlined, FileOutlined} from '@ant-design/icons';

import {setSelectedItem} from '@redux/git';
import {useAppDispatch} from '@redux/hooks';

import {TitleBar} from '@molecules';

import {Dots, Icon} from '@components/atoms';

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
  const dispatch = useAppDispatch();
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

  const handleFileClick = e => {
    // e.preventDefault();
    console.log('handleFileClick!');
    dispatch(setSelectedItem());
  };

  const menuItems = [
    {
      key: 'commit_to_new',
      label: <div>Commit to a new branch & PR</div>,
    },
    {
      key: 'commit_to_main',
      label: <div>Commit to the main branch & PR</div>,
    },
    {
      key: 'diff',
      label: <div>Diff</div>,
    },
    {
      key: 'rollback',
      label: <div>Rollback</div>,
    },
  ];

  const DropdownMenu = <Menu items={menuItems} />;

  return (
    <S.GitPaneContainer id="GitPane" style={{height}}>
      <TitleBar title="Commit" closable />
      <S.Files>
        <S.FileList>
          <S.ChangeListWrapper>
            <Checkbox onChange={handleSelectAll}>
              <S.ChangeList>
                Changelist <S.ChangeListStatus>{data.length} files</S.ChangeListStatus>
              </S.ChangeList>
            </Checkbox>
          </S.ChangeListWrapper>
          <List
            dataSource={list}
            renderItem={item => {
              return (
                <List.Item
                  onMouseEnter={() => handleEnter(item)}
                  onMouseLeave={handleLeave}
                  style={{
                    borderBottom: 'none',
                    padding: '6px 14px 6px 14px',
                    justifyContent: 'flex-start',
                    background: selected.find(searchItem => searchItem.id === item.id) && 'rgba(255, 255, 255, 0.07)',
                  }}
                >
                  <S.SelectAll>
                    <Checkbox
                      onChange={e => handleSelect(e, item)}
                      checked={selected.find(searchItem => searchItem.id === item.id)}
                    />
                  </S.SelectAll>
                  <S.FileItem>
                    <S.FileItemData onClick={handleFileClick}>
                      <S.FileIcon>
                        <FileOutlined />
                      </S.FileIcon>
                      {item.name}
                      <S.FilePath>{item.path}</S.FilePath>
                    </S.FileItemData>
                    {hovered.id === item.id && (
                      <Dropdown overlay={DropdownMenu} trigger={['click']}>
                        <Space onClick={e => e.preventDefault()}>
                          <Dots />
                        </Space>
                      </Dropdown>
                    )}
                  </S.FileItem>
                </List.Item>
              );
            }}
          />
        </S.FileList>

        {selected.length > 0 && (
          <S.FilesAction>
            <Dropdown overlay={DropdownMenu} trigger={['click']}>
              <Space>
                <Button type="primary" onClick={e => e.preventDefault()} size="large">
                  <Icon name="git-ops" />
                  Commit to a new branch & PR
                  <DownOutlined />
                </Button>
              </Space>
            </Dropdown>
          </S.FilesAction>
        )}
      </S.Files>
    </S.GitPaneContainer>
  );
};

export default GitPane;
