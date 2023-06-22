import {ChangeEvent, useCallback, useRef} from 'react';
import {useAsync} from 'react-use';

import {Button, Input as RawInput, Skeleton, Tooltip, Typography} from 'antd';

import {PlusCircleFilled, SearchOutlined as RawSearchOutlined} from '@ant-design/icons';

import {debounce} from 'lodash';
import styled from 'styled-components';

import {currentKubeContextSelector} from '@redux/appConfig';
import {setSelectedHelmRelease} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setHelmPaneChartSearch, setLeftMenuSelection} from '@redux/reducers/ui';

import AccordionPanel, {InjectedPanelProps} from '@components/atoms/AccordionPanel/AccordionPanel';

import {TitleBar, TitleBarCount} from '@monokle/components';
import {HelmRelease} from '@shared/models/ui';
import {Colors} from '@shared/styles';
import {listHelmReleasesCommand, runCommandInMainThread} from '@shared/utils/commands';

import * as S from './DashboardPane.style';
import HelmReleasesList from './HelmReleasesList';

const HelmReleasesPane: React.FC<InjectedPanelProps> = props => {
  const {isActive} = props;
  const dispatch = useAppDispatch();
  const selectedNamespace = useAppSelector(state => state.main.clusterConnection?.namespace);
  const helmRepoSearch = useAppSelector(state => state.ui.helmPane.chartSearchToken);
  const currentContext = useAppSelector(currentKubeContextSelector);

  const {value: list = [], loading} = useAsync(async () => {
    const output = await runCommandInMainThread(
      listHelmReleasesCommand({filter: helmRepoSearch, namespace: selectedNamespace?.replace('<all>', '')})
    );
    if (output.stderr) {
      throw new Error(output.stderr);
    }
    return JSON.parse(output.stdout || '[]') as HelmRelease[];
  }, [helmRepoSearch, selectedNamespace]);

  const debouncedSearchRef = useRef(
    debounce((search: string) => {
      dispatch(setHelmPaneChartSearch(search));
    }, 400)
  );

  const onChangeSearchInputHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    debouncedSearchRef.current(e.target.value);
  }, []);

  const onBrowseHelmClickHandler = () => {
    dispatch(setSelectedHelmRelease(null));
    dispatch(setLeftMenuSelection('helm'));
  };

  return (
    <AccordionPanel
      {...props}
      key="helm-releases"
      showArrow={false}
      header={
        <TitleBar
          title="Helm"
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

const Description = styled(Typography.Text)`
  font-weight: 600;
  font-size: 10px;
  line-height: 16px;
`;

export const SearchOutlined = styled(RawSearchOutlined)`
  color: ${Colors.grey6};
`;
