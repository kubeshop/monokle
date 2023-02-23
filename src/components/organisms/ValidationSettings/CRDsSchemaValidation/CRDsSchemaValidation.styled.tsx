import {Button, Divider, Input} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const Container = styled.div`
  margin: 16px;
`;

export const List = styled.ul`
  margin-bottom: 0;
`;

export const RegisterContainer = styled.div`
  overflow: hidden;
  background-color: ${Colors.grey1};
  padding: 16px;
`;

export const RegisterInput = styled(Input)``;

export const Subtitle = styled.h2`
  margin-top: 16px;
`;

export const CancelButton = styled(Button)`
  margin-right: 8px;
`;

export const Error = styled.p`
  font-size: 12px;
  color: ${Colors.redError};
`;

export const FileBrowserContainer = styled.div<{$isVertical: boolean}>`
  margin-bottom: 24px;
  ${({$isVertical}) =>
    !$isVertical &&
    `
  display: flex;
  justify-content: space-between;
  align-items: center;
  `}
`;

export const FileBrowserButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const FilesPlaceholder = styled.p`
  margin: 0;
`;

export const FirstDivider = styled(Divider)`
  margin-top: 0 !important;
`;

export const RegisterActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const FileUL = styled.ul`
  list-style-type: none;
  padding: 0;
`;

export const FileLI = styled.li`
  font-size: 12px;
  margin-bottom: 6px;
`;
