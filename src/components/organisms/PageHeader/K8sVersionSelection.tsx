import {Dropdown, Menu, Typography} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateK8sVersion} from '@redux/reducers/appConfig';
import {downloadK8sSchema} from '@redux/thunks/downloadK8sSchema';

import {doesSchemaExist} from '@utils/index';

import {K8S_VERSIONS} from '@shared/constants';

import * as S from './K8sVersionSelection.style';

export const K8sVersionSelection = () => {
  const dispatch = useAppDispatch();
  const appConfig = useAppSelector(state => state.config);
  const userDataDir = useAppSelector(state => state.config.userDataDir);

  const selectedK8SVersion = String(appConfig?.k8sVersion);

  const handleK8SVersionChange = (k8sVersion: string) => {
    if (doesSchemaExist(k8sVersion, userDataDir)) {
      dispatch(updateK8sVersion(k8sVersion));
    } else {
      dispatch(downloadK8sSchema(k8sVersion));
    }
  };

  const menu = (
    <S.MenuContainer>
      <Menu>
        {K8S_VERSIONS.map(version => (
          <S.MenuItem
            key={version}
            $selected={version === selectedK8SVersion}
            onClick={() => handleK8SVersionChange(version)}
          >
            <Typography.Text>{version}</Typography.Text>
          </S.MenuItem>
        ))}
      </Menu>
      <S.MenuBottom>
        <S.WarningText>
          Selecting another K8s Schema can bring <Typography.Text type="danger">new validation errors.</Typography.Text>
          Check them out in from the left menu.
        </S.WarningText>
      </S.MenuBottom>
    </S.MenuContainer>
  );

  return (
    <S.Container>
      <Dropdown
        arrow
        overlay={menu}
        placement="bottomLeft"
        getPopupContainer={() => document.getElementById('k8sVList')!}
      >
        <Typography.Text style={{cursor: 'pointer'}}>
          v.<S.K8sVersionText>{String(selectedK8SVersion)}</S.K8sVersionText>
        </Typography.Text>
      </Dropdown>
      <S.MenuDropdownList>
        <div id="k8sVList" />
      </S.MenuDropdownList>
    </S.Container>
  );
};
