import React from 'react';
import {ItemCustomComponentProps} from '@models/navigator';
import {Tag} from 'antd';

function ResourceKindNameDisplay(props: ItemCustomComponentProps) {
  const {itemInstance} = props;
  if (itemInstance.name.startsWith('Patch:')) {
    return (
      <>
        {itemInstance.name.replace('Patch:', '').trim()} <Tag>Patch</Tag>
      </>
    );
  }
  return <>{itemInstance.name}</>;
}

export default ResourceKindNameDisplay;
