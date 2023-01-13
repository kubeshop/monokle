import {Dropdown, Menu, Typography} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateProjectK8sVersion} from '@redux/reducers/appConfig';
import {downloadK8sSchema} from '@redux/thunks/downloadK8sSchema';

import {doesSchemaExist} from '@utils/index';

import {K8S_VERSIONS} from '@shared/constants';

import * as S from './K8sVersionSelection.style';

export const K8sVersionSelection = () => {
  const dispatch = useAppDispatch();
  const selectedK8SVersion = useAppSelector(state => state.config?.projectConfig?.k8sVersion);
  const userDataDir = useAppSelector(state => state.config.userDataDir);

  const handleK8SVersionChange = async (k8sVersion: string) => {
    if (doesSchemaExist(k8sVersion, userDataDir)) {
      dispatch(updateProjectK8sVersion(k8sVersion));
    } else {
      await dispatch(downloadK8sSchema(k8sVersion)).unwrap();
      dispatch(updateProjectK8sVersion(k8sVersion));
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
