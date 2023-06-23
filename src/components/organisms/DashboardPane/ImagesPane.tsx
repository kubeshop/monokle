import {ChangeEvent, useCallback, useRef} from 'react';

import {Input as RawInput, Tooltip} from 'antd';

import {SearchOutlined as RawSearchOutlined} from '@ant-design/icons';

import {debounce, size} from 'lodash';
import styled from 'styled-components';

import {currentKubeContextSelector} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setImagesSearchedValue} from '@redux/reducers/main';

import AccordionPanel, {InjectedPanelProps} from '@components/atoms/AccordionPanel/AccordionPanel';

import {TitleBar, TitleBarCount} from '@monokle/components';
import {Colors} from '@shared/styles';

import * as S from './DashboardPane.style';
import ImagesList from './ImagesList';

const ImagesPane: React.FC<InjectedPanelProps> = props => {
  const {isActive} = props;
  const dispatch = useAppDispatch();
  const currentContext = useAppSelector(currentKubeContextSelector);
  const imageMap = useAppSelector(state => state.main.imageMap);

  const debouncedSearchRef = useRef(
    debounce((search: string) => {
      dispatch(setImagesSearchedValue(search));
    }, 400)
  );

  const onChangeSearchInputHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    debouncedSearchRef.current(e.target.value);
  }, []);

  return (
    <AccordionPanel
      {...props}
      key="images"
      showArrow={false}
      header={
        <TitleBar
          title="Images"
          expandable
          isOpen={Boolean(isActive)}
          actions={<TitleBarCount count={size(imageMap)} isActive={Boolean(isActive)} />}
          description={
            <S.ConnectedContainer>
              <Tooltip title="Successfully connected!" placement="bottomRight">
                <S.CheckCircleFilled />
              </Tooltip>
              <S.ConnectedText>{currentContext}</S.ConnectedText>
            </S.ConnectedContainer>
          }
        />
      }
    >
      <div style={{padding: '0px 16px 16px 16px'}}>
        <Input
          placeholder="Search & filter images"
          prefix={<SearchOutlined />}
          allowClear
          onChange={onChangeSearchInputHandler}
        />
        <ImagesList />
      </div>
    </AccordionPanel>
  );
};
export default ImagesPane;

const Input = styled(RawInput)`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  border: none;
  width: 100%;
`;

export const SearchOutlined = styled(RawSearchOutlined)`
  color: ${Colors.grey6};
`;
