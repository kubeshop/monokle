import {Tag} from 'antd';
import React from 'react';

import {ItemCustomComponentProps} from '@models/navigator';

import Colors from '@styles/Colors';

function ResourceKindNameDisplay(props: ItemCustomComponentProps) {
  const {itemInstance} = props;
  if (itemInstance.name.startsWith('Patch:')) {
    return (
      <>
        {itemInstance.name.replace('Patch:', '').trim()}{' '}
        <Tag style={{color: itemInstance.isSelected ? Colors.blackPure : undefined}}>Patch</Tag>
      </>
    );
  }
  return <>{itemInstance.name}</>;
}

export default ResourceKindNameDisplay;
