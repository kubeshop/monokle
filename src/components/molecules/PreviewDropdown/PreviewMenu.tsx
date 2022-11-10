import {Menu} from 'antd';

import {MenuClickEventHandler} from 'rc-menu/lib/interface';

import {HelmChartMenuItem, KustomizationMenuItem} from '@monokle-desktop/shared';

const {SubMenu} = Menu;

interface IProps {
  helmCharts: HelmChartMenuItem[];
  kustomizations: KustomizationMenuItem[];
  onClick: MenuClickEventHandler;
  previewKey?: string;
}

const PreviewMenu: React.FC<IProps> = props => {
  const {helmCharts, kustomizations, previewKey, onClick} = props;

  return (
    <Menu onClick={onClick} selectedKeys={previewKey ? [previewKey] : undefined}>
      <SubMenu title="Helm Charts" key="helmcharts" disabled={helmCharts.length === 0}>
        {helmCharts.map(helmChart => (
          <Menu.ItemGroup title={helmChart.name} key={helmChart.id}>
            {helmChart.subItems.map(valuesFile => (
              <Menu.Item key={`valuesFile__${valuesFile.id}`}>{valuesFile.name}</Menu.Item>
            ))}
          </Menu.ItemGroup>
        ))}
      </SubMenu>

      <SubMenu
        title="Kustomizations"
        style={{maxHeight: 250}}
        key="kustomizations"
        disabled={kustomizations.length === 0}
      >
        {kustomizations.map(kustomization => (
          <Menu.Item key={`kustomization__${kustomization.id}`}>{kustomization.name}</Menu.Item>
        ))}
      </SubMenu>
    </Menu>
  );
};

export default PreviewMenu;
