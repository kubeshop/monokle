import {useDispatch} from 'react-redux';
import {useAsync} from 'react-use';

import {Input, Typography} from 'antd';

import {debounce} from 'lodash';
import styled from 'styled-components';

import {searchHelmRepo} from '@redux/reducers/ui';

import {Icon} from '@monokle/components';
import {Colors} from '@shared/styles';
import {listHelmRepoCommand, runCommandInMainThread} from '@shared/utils/commands';

const HelmRepoPane = () => {
  const dispatch = useDispatch();
  const onHelmRepoSearchChangeHandler = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(searchHelmRepo(e.target.value));
  });

  const {value: data = []} = useAsync(async () => {
    const result = await runCommandInMainThread(listHelmRepoCommand());
    if (result.stderr) {
      throw new Error(result.stderr);
    }
    return JSON.parse(result.stdout || '[]');
  });
  return (
    <Container>
      <HelmExplorer>
        <HelmExplorerTitle>Browse Helm Charts</HelmExplorerTitle>
        <HelmExplorerInput
          prefix={<Icon name="globe-search" />}
          placeholder="Search Charts to download"
          onChange={onHelmRepoSearchChangeHandler}
        />
      </HelmExplorer>
      <div>
        <Typography.Title level={4}>Installed Repositories</Typography.Title>
        {data.map((item: any) => {
          return <div key={item.name}>{item.name}</div>;
        })}
      </div>
    </Container>
  );
};

export default HelmRepoPane;

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 100px 1fr;
  height: 100%;
  row-gap: 8px;
  margin-top: 24px;
  padding: 0px 24px 16px 24px; ;
`;

const HelmExplorer = styled.div`
  position: sticky;
  top: 0;
  height: 100px;
  background-color: rgba(82, 115, 224, 0.3);
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
  padding-left: 16px;
  padding-right: 14px;
  z-index: 10;
`;

const HelmExplorerTitle = styled(Typography.Text)`
  font-size: 14px;
  line-height: 22px;
  font-weight: 600;
  color: ${Colors.grey9};
`;

const HelmExplorerInput = styled(Input)`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  width: unset !important;
  border: none !important;
  font-size: 14px !important;
  line-height: 22px !important;

  ::placeholder {
    color: ${Colors.grey8};
  }

  svg {
    color: ${Colors.grey8};
    margin-right: 8px;
  }
`;
