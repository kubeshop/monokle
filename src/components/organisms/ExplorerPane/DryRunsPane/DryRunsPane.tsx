import {useLayoutEffect, useRef} from 'react';

import {Button, Dropdown, Skeleton} from 'antd';

import {CodeOutlined} from '@ant-design/icons';

import {size} from 'lodash';
import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';
import {dryRunNodesSelector} from '@redux/selectors/dryRunsSelectors';

import {TitleBarWrapper} from '@components/atoms';

import {Icon, TitleBar} from '@monokle/components';
import {Colors} from '@shared/styles/colors';
import {elementScroll, useVirtualizer} from '@tanstack/react-virtual';

import CommandRenderer from './CommandRenderer';
import HelmChartRenderer from './HelmChartRenderer';
import HelmConfigRenderer from './HelmConfigRenderer';
import HelmValueRenderer from './HelmValueRenderer';
import KustomizeRenderer from './KustomizeRenderer';
import {useNewDryRunsMenuItems} from './useNewDryRunsMenuItems';

const ROW_HEIGHT = 26;

const DryRunsPane: React.FC = () => {
  const list = useAppSelector(dryRunNodesSelector);
  const isLoading = useAppSelector(state => state.ui.isFolderLoading);

  const preview = useAppSelector(state => state.main.preview);
  const menuItems = useNewDryRunsMenuItems();
  const ref = useRef<HTMLUListElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: list.length,
    estimateSize: () => ROW_HEIGHT,
    getScrollElement: () => ref.current,
    scrollToFn: elementScroll,
  });

  useLayoutEffect(() => {
    if (!preview) {
      return;
    }

    const index = list.findIndex(item => {
      if (item.type === 'command' && preview.type === 'command') {
        return item.commandId === preview.commandId;
      }
      if (item.type === 'helm-values' && preview.type === 'helm') {
        return item.valuesId === preview.valuesFileId;
      }
      if (item.type === 'helm-config' && preview.type === 'helm-config') {
        return item.configId === preview.configId;
      }
      if (item.type === 'kustomize' && preview.type === 'kustomize') {
        return item.kustomizationId === preview.kustomizationId;
      }
      return false;
    });

    rowVirtualizer.scrollToIndex(index);
  }, [preview, list, rowVirtualizer]);

  if (isLoading) {
    return (
      <div style={{padding: '16px'}}>
        <Skeleton active />
      </div>
    );
  }

  if (!size(list)) {
    return <EmptyText>No Dry runs found in the current project.</EmptyText>;
  }

  return (
    <Container>
      <TitleBarWrapper>
        <TitleBar
          type="secondary"
          headerStyle={{background: '#232A2D'}}
          isOpen
          title="Dry runs"
          actions={
            <div>
              <Dropdown trigger={['click']} menu={{items: menuItems}} overlayClassName="dropdown-secondary">
                <NewButton id="create-dry-run-button" size="small">
                  New
                </NewButton>
              </Dropdown>
            </div>
          }
        />
      </TitleBarWrapper>
      <ListContainer ref={ref}>
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map(virtualItem => {
            const node = list[virtualItem.index];

            if (!node) {
              return null;
            }

            return (
              <VirtualItem
                key={virtualItem.key}
                style={{
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {node.type === 'heading' ? (
                  <Heading>
                    {node.icon === 'command' ? <CodeOutlined /> : <Icon name={node.icon} />}
                    {node.title.trim() !== '' && <span>{node.title}</span>}
                    {node.subtitle && <Prefix>{node.subtitle}</Prefix>}
                  </Heading>
                ) : node.type === 'kustomize' ? (
                  <KustomizeRenderer kustomizationId={node.kustomizationId} />
                ) : node.type === 'helm-chart' ? (
                  <HelmChartRenderer id={node.chartId} />
                ) : node.type === 'helm-values' ? (
                  <HelmValueRenderer id={node.valuesId} />
                ) : node.type === 'helm-config' ? (
                  <HelmConfigRenderer id={node.configId} />
                ) : node.type === 'command' ? (
                  <CommandRenderer id={node.commandId} />
                ) : null}
              </VirtualItem>
            );
          })}
        </div>
      </ListContainer>
    </Container>
  );
};

export default DryRunsPane;

// Styled Components

const EmptyText = styled.div`
  padding: 16px;
  color: ${Colors.grey8};
`;

const ListContainer = styled.ul`
  height: 100%;
  overflow-y: auto;
  padding: 0px 0px;
`;

const VirtualItem = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
`;

const Heading = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 20px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  justify-content: left;
`;

export const PanelContainer = styled.div`
  height: 100%;
  max-height: inherit;
  background-color: ${Colors.grey10};
  overflow: hidden;
  z-index: -2;
  display: flex;
  flex-flow: column;
  overflow-y: auto;
`;

const Container = styled(PanelContainer)`
  display: flex;
  flex-flow: column;
  overflow-y: auto;
`;

const Prefix = styled.span`
  font-weight: 200;
  color: ${Colors.grey6};
`;

const NewButton = styled(Button)`
  font-size: 12px;
`;
