import {useMemo} from 'react';

import {Select} from 'antd';

import {sep} from 'path';

import {useAppSelector} from '@redux/hooks';

export function useFileSelectOptions() {
  const fileMap = useAppSelector(state => state.main.fileMap);

  const filesList: string[] = useMemo(() => {
    const files: string[] = [];

    Object.entries(fileMap).forEach(([key, value]) => {
      if (value.children || !value.containsK8sResources || value.isExcluded) {
        return;
      }
      files.push(key.replace(sep, ''));
    });

    return files;
  }, [fileMap]);

  return filesList.map(fileName => (
    <Select.Option key={fileName} value={fileName}>
      {fileName}
    </Select.Option>
  ));
}
