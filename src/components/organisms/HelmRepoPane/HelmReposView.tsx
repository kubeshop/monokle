import {useCallback, useEffect, useMemo} from 'react';
import {useAsyncFn} from 'react-use';

import {Button, Form, Input, Modal, Tooltip, Typography} from 'antd';

import {DeleteOutlined} from '@ant-design/icons';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';

import {errorAlert, successAlert} from '@utils/alert';
import {addHelmRepoCommand, listHelmRepoCommand, removeHelmRepoCommand, updateHelmRepoCommand} from '@utils/helm';
import {useMainPaneDimensions} from '@utils/hooks';

import {trackEvent} from '@shared/utils';
import {runCommandInMainThread} from '@shared/utils/commands';

import * as S from './styled';

type onRepoCellClick = (repoName: string) => void;

const createColumns = (onUpdateHelmRepoClick: onRepoCellClick, onRemoveHelmRepoClick: onRepoCellClick) => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
    responsive: ['sm'],
    sorter: {
      compare: (a: {name: string}, b: {name: string}) => a.name.localeCompare(b.name),
    },
  },
  {
    title: 'URL',
    dataIndex: 'url',
    key: 'url',
    responsive: ['sm'],
  },
  {
    title: '',
    dataIndex: '',
    key: 'x',
    responsive: ['sm'],

    render: (_text: string, record: any) => {
      return (
        <S.HoverArea>
          <Tooltip title="helm repo update">
            <Button type="primary" style={{marginRight: 24}} onClick={() => onUpdateHelmRepoClick(record.name)}>
              Update
            </Button>
          </Tooltip>
          <Tooltip title="helm repo remove">
            <S.DeleteButton
              type="text"
              icon={<DeleteOutlined style={{color: 'red'}} />}
              onClick={() => onRemoveHelmRepoClick(record.name)}
            />
          </Tooltip>
        </S.HoverArea>
      );
    },
  },
];

const HelmReposTable = () => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const {height} = useMainPaneDimensions();
  const terminalHeight = useAppSelector(state => state.ui.paneConfiguration.bottomPaneHeight);
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);

  const [{value: data = [], loading}, refetchRepos] = useAsyncFn(async () => {
    const result = await runCommandInMainThread(listHelmRepoCommand());
    if (result.stderr) {
      throw new Error(result.stderr);
    }
    return JSON.parse(result.stdout || '[]');
  });

  const reposCount = data.length;

  useEffect(() => {
    refetchRepos();
  }, [refetchRepos]);

  const onAddRepoHandler = async (values: {name: string; url: string}) => {
    const result = await runCommandInMainThread(addHelmRepoCommand(values));
    if (result.stdout) {
      dispatch(setAlert(successAlert(`${values.name} added successfully`)));

      form.resetFields();
      refetchRepos();
      trackEvent('helm_repo/add');
    }
    if (result.stderr) {
      dispatch(setAlert(errorAlert(result.stderr)));
    }
  };

  const onUpdateRepoHandler = useCallback(
    async (repoName: string) => {
      try {
        await runCommandInMainThread(updateHelmRepoCommand({repos: [repoName]}));
        refetchRepos();
        dispatch(setAlert(successAlert('Repository updated successfully')));
        trackEvent('helm_repo/update');
      } catch (e: any) {
        dispatch(setAlert(errorAlert(e.message)));
      }
    },
    [dispatch, refetchRepos]
  );

  const onRemoveRepoHandler = useCallback(
    async (repoName: string) => {
      Modal.confirm({
        title: `Are you sure you want to remove [${repoName}] repo?`,
        onOk: async () => {
          try {
            await runCommandInMainThread(removeHelmRepoCommand({repos: [repoName]}));
            dispatch(setAlert(successAlert('Repository removed successfully')));
            refetchRepos();
            trackEvent('helm_repo/remove');
          } catch (e: any) {
            dispatch(setAlert(errorAlert(e.message)));
          }
        },
      });
    },
    [dispatch, refetchRepos]
  );

  const columns = useMemo(
    () => createColumns(onUpdateRepoHandler, onRemoveRepoHandler),
    [onUpdateRepoHandler, onRemoveRepoHandler]
  );

  return (
    <>
      <Typography.Text style={{marginTop: 16, marginBottom: 8}}>Add a new Helm Chart repository</Typography.Text>
      <div style={{height: 60}}>
        <Form layout="inline" form={form} onFinish={onAddRepoHandler}>
          <S.FormItem name="name" rules={[{required: true, type: 'string'}]}>
            <Input size="large" placeholder="Enter a name to identify it" />
          </S.FormItem>
          <S.FormItem name="url" rules={[{required: true, type: 'url'}]}>
            <Input size="large" placeholder="Enter a valid repository URL and click to proceed" />
          </S.FormItem>

          <Button size="large" type="primary" htmlType="submit">
            Add
          </Button>
        </Form>
      </div>
      <Typography.Text style={{marginTop: 8}}>
        Using {reposCount} Helm Chart repositories, update or remove them below.
      </Typography.Text>
      <S.Table
        sticky
        rowKey="name"
        columns={columns}
        dataSource={data}
        pagination={false}
        loading={loading}
        sortDirections={['ascend', 'descend']}
        scroll={{y: height - 400 - (bottomSelection === 'terminal' ? terminalHeight : 0)}}
      />
    </>
  );
};

export default HelmReposTable;
