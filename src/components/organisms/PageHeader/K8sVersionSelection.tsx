import {Dropdown, Typography} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateProjectK8sVersion} from '@redux/reducers/appConfig';
import {downloadK8sSchema} from '@redux/thunks/downloadK8sSchema';

import {doesSchemaExist} from '@utils/index';

import {K8S_VERSIONS} from '@shared/constants/k8s';

import * as S from './K8sVersionSelection.style';

export const K8sVersionSelection = () => {
  const dispatch = useAppDispatch();
  const selectedK8SVersion = useAppSelector(state => state.config?.projectConfig?.k8sVersion);
  const userDataDir = useAppSelector(state => String(state.config.userDataDir));

  const handleK8SVersionChange = async (k8sVersion: string) => {
    if (doesSchemaExist(k8sVersion, userDataDir)) {
      dispatch(updateProjectK8sVersion(k8sVersion));
    } else {
      await dispatch(downloadK8sSchema(k8sVersion)).unwrap();
      dispatch(updateProjectK8sVersion(k8sVersion));
    }
  };

  const menuItems = K8S_VERSIONS.map(version => ({
    label: version,
    key: version,
    className: version === selectedK8SVersion ? 'selected-menu-item' : '',
    onClick: () => handleK8SVersionChange(version),
  }));

  const dropdownRender = (menu: React.ReactNode) => (
    <S.MenuContainer>
      {menu}

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
        menu={{items: menuItems}}
        placement="bottomLeft"
        dropdownRender={dropdownRender}
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
