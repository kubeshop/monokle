import {Tag} from 'antd';

import {DateTime} from 'luxon';

import {ResourceRefsIconPopover} from '@components/molecules';

import {timeAgo} from '@utils/timeAgo';
import {convertBytesToGigabyte, memoryParser} from '@utils/unit-converter';

import {K8sResource} from '@shared/models/k8sResource';
import {isDefined} from '@shared/utils/filter';

import ErrorCell from './ErrorCell';
import ResourceActionsDropdown from './ResourceActionsDropdown';
import * as S from './TableCells.styled';

const UNSORTED_VALUE = -9999999;

export const CellStatus = {
  title: 'Status',
  dataIndex: 'object',
  key: 'status',
  width: '120px',
  render: (object: any) => (
    <div>
      {object.status?.containerStatuses && object.status?.containerStatuses[0]?.state?.waiting?.reason
        ? (object.status?.containerStatuses[0]?.state?.waiting?.reason === 'ContainerCreating' && (
            <S.StatusPending>{object.status?.containerStatuses[0]?.state?.waiting?.reason}</S.StatusPending>
          )) ||
          (object.status?.containerStatuses[0]?.state?.waiting?.reason === 'ErrImagePull' && (
            <S.StatusTerminating>{object.status?.containerStatuses[0]?.state?.waiting?.reason}</S.StatusTerminating>
          )) ||
          (object.status?.containerStatuses[0]?.state?.waiting?.reason === 'ImagePullBackOff' && (
            <S.StatusTerminating>{object.status?.containerStatuses[0]?.state?.waiting?.reason}</S.StatusTerminating>
          )) ||
          (object.status?.containerStatuses[0]?.state?.waiting?.reason ? (
            <Tag color="magenta">{object.status?.containerStatuses[0]?.state?.waiting?.reason}</Tag>
          ) : (
            <span>-</span>
          ))
        : (object?.status?.phase === 'Succeeded' && <S.StatusActive>{object?.status?.phase}</S.StatusActive>) ||
          (object?.status?.phase === 'Running' && <S.StatusRunning>{object?.status?.phase}</S.StatusRunning>) ||
          (object?.status?.phase === 'Bound' && <S.StatusRunning>{object?.status?.phase}</S.StatusRunning>) ||
          (object?.status?.phase === 'Pending' && <S.StatusPending>{object?.status?.phase}</S.StatusPending>) ||
          (object?.status?.phase === 'Terminating' && (
            <S.StatusTerminating>{object?.status?.phase}</S.StatusTerminating>
          )) ||
          (object?.status?.phase === 'Active' && <S.StatusActive>{object?.status?.phase}</S.StatusActive>) ||
          (object?.status?.phase ? <Tag color="magenta">{object?.status?.phase}</Tag> : <span>-</span>)}
    </div>
  ),
  sorter: (a: K8sResource, b: K8sResource) => a.object?.status?.phase?.localeCompare(b.object?.status?.phase),
};

export const CellAge = {
  title: 'Age',
  dataIndex: 'object',
  key: 'age',
  width: '120px',
  render: (object: any) => (
    <div>{object.metadata?.creationTimestamp ? timeAgo(object.metadata.creationTimestamp) : ''}</div>
  ),
  sorter: (a: K8sResource, b: K8sResource) =>
    DateTime.fromISO(a.object.metadata?.creationTimestamp).toMillis() -
    DateTime.fromISO(b.object.metadata?.creationTimestamp).toMillis(),
};

export const CellContextMenu = {
  title: '',
  dataIndex: '',
  key: 'contextMenu',
  width: '20px',
  render: (resource: K8sResource<'cluster'>) => <ResourceActionsDropdown resource={resource} />,
};

export const CellName = {
  title: 'Name',
  dataIndex: '',
  key: 'name',
  width: '400px',
  render: (resource: K8sResource) => (
    <div style={{display: 'flex'}}>
      <ResourceRefsIconPopover isSelected={false} isDisabled={false} resourceMeta={resource} type="incoming" />
      <div>{resource.name}</div>
      <ResourceRefsIconPopover isSelected={false} isDisabled={false} resourceMeta={resource} type="outgoing" />
    </div>
  ),
  sorter: (a: K8sResource, b: K8sResource) => a.name.localeCompare(b.name),
  // defaultSortOrder: 'ascend', // TODO: getting type error if I add this
};

export const CellNamespace = {
  title: 'Namespace',
  dataIndex: 'namespace',
  key: 'namespace',
  width: '150px',
  render: (namespace: string) => <div>{namespace}</div>,
  sorter: (a: K8sResource, b: K8sResource) => a?.namespace?.localeCompare(b?.namespace || '') || UNSORTED_VALUE,
};

export const CellNode = {
  title: 'Node',
  dataIndex: 'object',
  key: 'node',
  width: '240px',
  render: (object: any) => <div>{object?.spec?.nodeName}</div>,
  sorter: (a: K8sResource, b: K8sResource) =>
    a?.object?.spec?.nodeName?.localeCompare(b?.object?.spec?.nodeName || '') || UNSORTED_VALUE,
};

export const CellError = {
  title: 'Errors',
  dataIndex: '',
  key: 'error',
  width: '150px',
  render: (resource: K8sResource) => <ErrorCell resourceId={resource.id} resourceKind={resource.kind} />,
  sorter: () => UNSORTED_VALUE,
};

export const CellLabels = {
  title: 'Labels',
  dataIndex: 'object',
  width: '400px',
  key: 'labels',
  render: (object: any) =>
    object.metadata.labels ? (
      Object.keys(object.metadata.labels).map(key => (
        <div key={key + object.metadata.labels[key]}>
          <Tag color="geekblue">
            {key}={object.metadata.labels[key]}
          </Tag>
        </div>
      ))
    ) : (
      <span style={{padding: '2px 4px'}}>-</span>
    ),
  sorter: (a: K8sResource, b: K8sResource) =>
    Object.keys(a.object.metadata.labels).length - Object.keys(b.object.metadata.labels).length,
};

export const CellRestartCount = {
  title: 'Restarts',
  dataIndex: 'object',
  key: 'restarts',
  width: '120px',
  render: (object: any) =>
    object?.status?.containerStatuses ? (
      <span style={{padding: '2px 4px'}}>{object?.status?.containerStatuses[0]?.restartCount || 0}</span>
    ) : (
      <span style={{padding: '2px 4px'}}>-</span>
    ),
  sorter: (a: K8sResource, b: K8sResource) =>
    a.object?.status?.containerStatuses && a.object?.status?.containerStatuses
      ? Number(a.object?.status?.containerStatuses[0].restartCount) -
        Number(b.object?.status?.containerStatuses[0].restartCount)
      : UNSORTED_VALUE,
};

export const CellPodsCount = {
  title: 'Pods',
  dataIndex: 'object',
  key: 'pods',
  width: '120px',
  render: (object: any) => (
    <span style={{padding: '2px 4px'}}>
      {object?.status?.availableReplicas || 0} / {object?.status?.replicas || 0}
    </span>
  ),
  sorter: (a: K8sResource, b: K8sResource) =>
    Number(b.object?.status?.availableReplicas || 0) - Number(a.object?.status?.availableReplicas || 0) ||
    UNSORTED_VALUE,
};

export const CellScheduledCount = {
  title: 'Scheduled',
  dataIndex: 'object',
  key: 'scheduled',
  width: '120px',
  render: (object: any) => (
    <span style={{padding: '2px 4px'}}>
      {object?.status?.currentNumberScheduled || 0} / {object?.status?.desiredNumberScheduled || 0}
    </span>
  ),
  sorter: (a: K8sResource, b: K8sResource) =>
    Number(a.object?.status?.currentNumberScheduled) - Number(b.object?.status?.currentNumberScheduled) ||
    UNSORTED_VALUE,
};

export const CellType = {
  title: 'Type',
  dataIndex: 'object',
  key: 'type',
  width: '150px',
  render: (object: any) =>
    object?.spec?.type ? (
      <span style={{padding: '2px 4px'}}>{object?.spec?.type}</span>
    ) : (
      <span style={{padding: '2px 4px'}}>-</span>
    ),
  sorter: (a: K8sResource, b: K8sResource) =>
    a?.object?.spec?.type?.localeCompare(b?.object?.spec?.type || '') || UNSORTED_VALUE,
};

export const CellGroup = {
  title: 'Group',
  dataIndex: 'object',
  key: 'group',
  width: '150px',
  render: (object: any) =>
    object?.spec?.group ? (
      <span style={{padding: '2px 4px'}}>{object?.spec?.group}</span>
    ) : (
      <span style={{padding: '2px 4px'}}>-</span>
    ),
  sorter: (a: K8sResource, b: K8sResource) =>
    a?.object?.spec?.group?.localeCompare(b?.object?.spec?.group || '') || UNSORTED_VALUE,
};

export const CellScope = {
  title: 'Scope',
  dataIndex: 'object',
  key: 'scope',
  width: '150px',
  render: (object: any) =>
    object?.spec?.scope ? (
      <span style={{padding: '2px 4px'}}>{object?.spec?.scope}</span>
    ) : (
      <span style={{padding: '2px 4px'}}>-</span>
    ),
  sorter: (a: K8sResource, b: K8sResource) =>
    a?.object?.spec?.scope?.localeCompare(b?.object?.spec?.scope || '') || UNSORTED_VALUE,
};

export const CellKind = {
  title: 'Resource',
  dataIndex: 'object',
  key: 'kind',
  width: '150px',
  render: (object: any) => {
    const kind = object?.spec?.names?.kind || object?.spec?.kind || object?.kind || '-';
    return <span style={{padding: '2px 4px'}}>{kind}</span>;
  },
  sorter: (a: K8sResource, b: K8sResource) =>
    a?.object?.spec?.names?.kind?.localeCompare(b?.object?.spec?.names?.kind || '') || UNSORTED_VALUE,
};

export const CellVersion = {
  title: 'Version',
  dataIndex: 'object',
  key: 'storedVersions',
  width: '150px',
  render: (object: any) =>
    object?.status?.storedVersions ? (
      <span style={{padding: '2px 4px'}}>{object?.status?.storedVersions[0]}</span>
    ) : (
      <span style={{padding: '2px 4px'}}>-</span>
    ),
  sorter: (a: K8sResource, b: K8sResource) =>
    a?.object?.status?.storedVersions[0]?.localeCompare(b?.object?.status?.storedVersions[0] || '') || UNSORTED_VALUE,
};

export const CellPorts = {
  title: 'Ports',
  dataIndex: 'object',
  key: 'ports',
  width: '150px',
  render: (object: any) =>
    object?.spec?.ports ? (
      object?.spec?.ports.map((data: {port: number; protocol: string}) => (
        <div key={data.port + data.protocol} style={{padding: '2px 4px'}}>
          {data.port}/{data.protocol}
        </div>
      ))
    ) : (
      <span style={{padding: '2px 4px'}}>-</span>
    ),
  sorter: (a: K8sResource, b: K8sResource) =>
    Number(a?.object?.spec?.ports?.length) - Number(b?.object?.spec?.ports?.length) || UNSORTED_VALUE,
};

export const CellIPs = {
  title: 'IPs',
  dataIndex: 'object',
  key: 'ips',
  width: '150px',
  render: (object: any) =>
    object?.spec?.clusterIPs ? (
      object?.spec?.clusterIPs.map((data: string) => (
        <div key={data} style={{padding: '2px 4px'}}>
          {data}
        </div>
      ))
    ) : (
      <span style={{padding: '2px 4px'}}>-</span>
    ),
  sorter: (a: K8sResource, b: K8sResource) =>
    Number(a?.object?.spec?.clusterIPs.length) - Number(b?.object?.spec?.clusterIPs.length) || UNSORTED_VALUE,
};

export const CellEndpoints = {
  title: 'Endpoints',
  dataIndex: 'object',
  key: 'endpoints',
  width: '240px',
  render: (object: any) =>
    object?.subsets ? (
      object?.subsets.map(
        (subset: {addresses: Array<{ip: string; nodeName: string}>; ports: Array<{port: number; protocol: string}>}) =>
          subset.addresses && subset.ports ? (
            subset.addresses.map(address =>
              subset.ports.map((port, index: number) => (
                // eslint-disable-next-line react/no-array-index-key
                <div key={address.ip + port.port + index} style={{padding: '2px 4px'}}>
                  {address.ip}:{port.port}
                </div>
              ))
            )
          ) : (
            <span style={{padding: '2px 4px'}}>-</span>
          )
      )
    ) : (
      <span style={{padding: '2px 4px'}}>-</span>
    ),
  sorter: (a: K8sResource, b: K8sResource) =>
    Number(a?.object?.subsets?.length) - Number(b?.object?.subsets?.length) || UNSORTED_VALUE,
};

export const LoadBalancerIPs = {
  title: 'LoadBalancers',
  dataIndex: 'object',
  key: 'loadbalancers',
  width: '150px',
  render: (object: any) =>
    object?.status?.loadBalancer?.ingress ? (
      object?.status?.loadBalancer?.ingress.map((data: {ip: string}) => (
        <div key={data.ip} style={{padding: '2px 4px'}}>
          {data.ip}
        </div>
      ))
    ) : (
      <span style={{padding: '2px 4px'}}>-</span>
    ),
  sorter: (a: K8sResource, b: K8sResource) =>
    Number(a?.object?.status?.loadBalancer?.ingress?.length) -
      Number(b?.object?.status?.loadBalancer?.ingress?.length) || UNSORTED_VALUE,
};

export const CellSecretType = {
  title: 'Type',
  dataIndex: 'object',
  key: 'secrettype',
  width: '150px',
  render: (object: any) =>
    object?.type ? (
      <span style={{padding: '2px 4px'}}>{object?.type}</span>
    ) : (
      <span style={{padding: '2px 4px'}}>-</span>
    ),
  sorter: (a: K8sResource, b: K8sResource) => a?.object?.type?.localeCompare(b?.object?.type || '') || UNSORTED_VALUE,
};

export const CellAddresses = {
  title: 'Addresses',
  dataIndex: 'object',
  key: 'addresses',
  width: '240px',
  render: (object: any) =>
    object?.status?.addresses ? (
      object?.status?.addresses.map((data: {address: string; type: string}) => (
        <div key={data.type + data.address} style={{padding: '2px 4px'}}>
          {data.type}: {data.address}
        </div>
      ))
    ) : (
      <span style={{padding: '2px 4px'}}>-</span>
    ),
  sorter: (a: K8sResource, b: K8sResource) =>
    Number(a?.object?.status?.addresses?.length) - Number(b?.object?.status?.addresses?.length) || UNSORTED_VALUE,
};

export const CellNodeOS = {
  title: 'Operating System',
  dataIndex: 'object',
  key: 'nodeOS',
  width: '288px',
  render: (object: any) => (
    <div>
      {object?.status?.nodeInfo?.operatingSystem &&
        object?.status?.nodeInfo?.osImage &&
        object?.status?.nodeInfo?.architecture && (
          <div>
            <span>{object?.status?.nodeInfo?.operatingSystem}, </span>
            <span>{object?.status?.nodeInfo?.architecture}, </span>
            <span>{object?.status?.nodeInfo?.osImage}</span>
          </div>
        )}
    </div>
  ),
  sorter: (a: K8sResource, b: K8sResource) =>
    a?.object?.status?.nodeInfo?.operatingSystem?.localeCompare(b?.object?.status?.nodeInfo?.operatingSystem || '') ||
    UNSORTED_VALUE,
};

export const CellNodeKubelet = {
  title: 'Kubelet',
  dataIndex: 'object',
  key: 'nodeKubelet',
  width: '180px',
  render: (object: any) => <div>{object?.status?.nodeInfo?.kubeletVersion || '-'}</div>,
  sorter: (a: K8sResource, b: K8sResource) =>
    a?.object?.status?.nodeInfo?.kubeletVersion?.localeCompare(b?.object?.status?.nodeInfo?.kubeletVersion || '') ||
    UNSORTED_VALUE,
};

export const CellNodeKernel = {
  title: 'Kernel',
  dataIndex: 'object',
  key: 'nodeKernel',
  width: '180px',
  render: (object: any) => <div>{object?.status?.nodeInfo?.kernelVersion || '-'}</div>,
  sorter: (a: K8sResource, b: K8sResource) =>
    a?.object?.status?.nodeInfo?.kernelVersion.localeCompare(b?.object?.status?.nodeInfo?.kernelVersion || '') ||
    UNSORTED_VALUE,
};

export const CellNodeContainerRuntime = {
  title: 'ContainerRuntime',
  dataIndex: 'object',
  key: 'containerRuntime',
  width: '180px',
  render: (object: any) => <div>{object?.status?.nodeInfo?.containerRuntimeVersion || '-'}</div>,
  sorter: (a: K8sResource, b: K8sResource) =>
    a?.object?.status?.nodeInfo?.containerRuntimeVersion.localeCompare(
      b?.object?.status?.nodeInfo?.containerRuntimeVersion || ''
    ) || UNSORTED_VALUE,
};

export const CellNodeRoles = {
  title: 'Roles',
  dataIndex: 'object',
  key: 'nodeRoles',
  width: '210px',
  render: (object: any) =>
    object?.metadata?.labels ? (
      <div>
        {isDefined(object?.metadata?.labels['node-role.kubernetes.io/master']) && <span>master</span>}
        {isDefined(object?.metadata?.labels['node-role.kubernetes.io/control-plane']) && (
          <span>{isDefined(object?.metadata?.labels['node-role.kubernetes.io/master']) && ', '}control-plane</span>
        )}
        {!isDefined(object?.metadata?.labels['node-role.kubernetes.io/master']) &&
          !isDefined(object?.metadata?.labels['node-role.kubernetes.io/control-plane']) && <span>-</span>}
      </div>
    ) : (
      <div>-</div>
    ),
  sorter: (a: K8sResource, b: K8sResource) =>
    a?.object?.metadata?.labels['node-role.kubernetes.io/control-plane']?.localeCompare(
      b?.object?.metadata?.labels['node-role.kubernetes.io/control-plane'] || ''
    ) || UNSORTED_VALUE,
};

export const CellStorageCapacity = {
  title: 'Capacity',
  dataIndex: 'object',
  key: 'storageCapacity',
  width: '120px',
  render: (object: any) =>
    object?.status?.capacity?.storage ? (
      <div>{convertBytesToGigabyte(memoryParser(object?.status?.capacity?.storage))}GB</div>
    ) : (
      <div>-</div>
    ),
  sorter: (a: K8sResource, b: K8sResource) =>
    Number(a?.object?.status?.capacity?.storage) - Number(b?.object?.status?.capacity?.storage) || UNSORTED_VALUE,
};
