import {useState} from 'react';

import {Checkbox, Dropdown, List, Space} from 'antd';
import {CheckboxChangeEvent} from 'antd/lib/checkbox';

import {FileOutlined} from '@ant-design/icons';

import {GitChangedFile} from '@models/git';

import {setSelectedItem} from '@redux/git';
import {useAppDispatch} from '@redux/hooks';

import {Dots} from '@components/atoms';

import DropdownMenu from './DropdownMenu';
import * as S from './FileList.styled';

type IProps = {
  files: GitChangedFile[];
  selectedFiles: GitChangedFile[];
  handleSelect: (e: CheckboxChangeEvent, item: GitChangedFile) => void;
};

const FileList: React.FC<IProps> = props => {
  const {files, selectedFiles, handleSelect} = props;

  const dispatch = useAppDispatch();

  const [hovered, setHovered] = useState<GitChangedFile | null>(null);

  return (
    <List
      style={{marginTop: '-6px'}}
      dataSource={files}
      renderItem={item => (
        <List.Item
          onMouseEnter={() => setHovered(item)}
          onMouseLeave={() => setHovered(null)}
          style={{
            borderBottom: 'none',
            padding: '6px 14px 6px 14px',
            marginBottom: '6px',
            justifyContent: 'flex-start',
            background: selectedFiles.find(searchItem => searchItem.name === item.name) && 'rgba(255, 255, 255, 0.07)',
          }}
        >
          <Checkbox
            onChange={e => handleSelect(e, item)}
            checked={Boolean(selectedFiles.find(searchItem => searchItem.name === item.name))}
          />

          <S.FileItem>
            <S.FileItemData onClick={() => dispatch(setSelectedItem(item))}>
              <S.FileIcon>
                <FileOutlined />
              </S.FileIcon>
              {item.name}
              <S.FilePath>{item.path}</S.FilePath>
            </S.FileItemData>

            {hovered?.name === item.name && (
              <Dropdown overlay={<DropdownMenu items={[item]} showStageUnstageOption />} trigger={['click']}>
                <Space onClick={e => e.preventDefault()}>
                  <Dots />
                </Space>
              </Dropdown>
            )}
          </S.FileItem>
        </List.Item>
      )}
    />
  );
};

export default FileList;
