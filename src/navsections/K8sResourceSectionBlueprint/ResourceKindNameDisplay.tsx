import React from 'react';
import {ItemCustomComponentProps} from '@models/navigator';
import {Tag} from 'antd';

function ResourceKindNameDisplay(props: ItemCustomComponentProps) {
  const {itemInstance} = props;
  if (itemInstance.name.startsWith('Patch:')) {
    return (
      <>
        <Tag>Patch</Tag>
        {itemInstance.name.replace('Patch:', '').trim()}
      </>
    );
  }
  return <>{itemInstance.name}</>;
}

export default ResourceKindNameDisplay;
