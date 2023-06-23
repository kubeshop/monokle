import {ChangeEvent, useCallback, useRef} from 'react';

import {Button, Input as RawInput, Skeleton, Tooltip, Typography} from 'antd';

import {PlusCircleFilled, SearchOutlined as RawSearchOutlined} from '@ant-design/icons';

import {debounce} from 'lodash';
import styled from 'styled-components';

import {currentKubeContextSelector} from '@redux/appConfig';
import {setSelectedHelmRelease} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setHelmPaneChartSearch, setLeftMenuSelection} from '@redux/reducers/ui';

import AccordionPanel, {InjectedPanelProps} from '@components/atoms/AccordionPanel/AccordionPanel';

import useGetHelmReleases from '@hooks/useGetHelmReleases';

import {TitleBar, TitleBarCount} from '@monokle/components';
import {Colors} from '@shared/styles';
import {trackEvent} from '@shared/utils';

import * as S from './DashboardPane.style';
import HelmReleasesList from './HelmReleasesList';

const HelmReleasesPane: React.FC<InjectedPanelProps> = props => {
  const {isActive} = props;
  const dispatch = useAppDispatch();
  const currentContext = useAppSelector(currentKubeContextSelector);

  const {list, loading} = useGetHelmReleases();

  const debouncedSearchRef = useRef(
    debounce((search: string) => {
      dispatch(setHelmPaneChartSearch(search));
      trackEvent('helm_release/search');
    }, 400)
  );

  const onChangeSearchInputHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    debouncedSearchRef.current(e.target.value);
  }, []);

  const onBrowseHelmClickHandler = () => {
    dispatch(setSelectedHelmRelease(null));
    dispatch(setLeftMenuSelection('helm'));
    trackEvent('helm_release/navigate_to_helm_repo');
  };

  return (
    <AccordionPanel
      {...props}
      key="helm-releases"
      showArrow={false}
      header={
        <TitleBar
          title="Helm Charts"
          expandable
          isOpen={Boolean(isActive)}
          actions={<TitleBarCount count={list.length} isActive={Boolean(isActive)} />}
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
        <S.StickyContainer>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Typography.Text>Installed Charts</Typography.Text>
            <Tooltip title="Find and install new Helm Charts." placement="rightBottom">
              <Button
                style={{paddingRight: 0}}
                type="link"
                icon={<PlusCircleFilled />}
                onClick={onBrowseHelmClickHandler}
              >
                New
              </Button>
            </Tooltip>
          </div>
          <Input
            placeholder="Search & filter installed"
            prefix={<SearchOutlined />}
            allowClear
            onChange={onChangeSearchInputHandler}
          />
        </S.StickyContainer>
        {loading ? <Skeleton style={{marginTop: 16}} active /> : <HelmReleasesList list={list} />}
      </div>
    </AccordionPanel>
  );
};
export default HelmReleasesPane;

const Input = styled(RawInput)`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  border: none;
  width: 100%;
`;

export const SearchOutlined = styled(RawSearchOutlined)`
  color: ${Colors.grey6};
`;
