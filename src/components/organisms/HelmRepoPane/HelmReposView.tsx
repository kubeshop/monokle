import {useCallback, useEffect, useMemo} from 'react';
import {useAsyncFn} from 'react-use';

import {Button, Form, Input, Modal, Typography} from 'antd';

import {DeleteOutlined} from '@ant-design/icons';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';

import {errorAlert, successAlert} from '@utils/alert';
import {useMainPaneDimensions} from '@utils/hooks';

import {trackEvent} from '@shared/utils';
import {
  addHelmRepoCommand,
  listHelmRepoCommand,
  removeHelmRepoCommand,
  runCommandInMainThread,
  updateHelmRepoCommand,
} from '@shared/utils/commands';

import * as S from './styled';

type onRepoCellClick = (repoName: string) => void;

const createColumns = (onUpdateHelmRepoClick: onRepoCellClick, onDeleteHelmRepoClick: onRepoCellClick) => [
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
          <Button
            id="updateHelm"
            type="primary"
            style={{marginRight: 24}}
            onClick={() => onUpdateHelmRepoClick(record.name)}
          >
            Update
          </Button>
          <S.DeleteButton
            id="deleteHelm"
            type="text"
            icon={<DeleteOutlined style={{color: 'red'}} />}
            onClick={() => onDeleteHelmRepoClick(record.name)}
          />
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

  const onDeleteRepoHandler = useCallback(
    async (repoName: string) => {
      Modal.confirm({
        title: `Are you sure you want to delete [${repoName}] repo?`,
        onOk: async () => {
          try {
            await runCommandInMainThread(removeHelmRepoCommand({repos: [repoName]}));
            dispatch(setAlert(successAlert('Repository deleted successfully')));
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
    () => createColumns(onUpdateRepoHandler, onDeleteRepoHandler),
    [onUpdateRepoHandler, onDeleteRepoHandler]
  );

  return (
    <>
      <Typography.Text style={{marginTop: 24, marginBottom: 16}}>Add a new Helm Chart repository</Typography.Text>
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

      <Typography.Text style={{marginTop: 32, marginBottom: 24}}>
        {reposCount} Helm Chart repositories added. You can update or delete them.
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
