import {Button} from 'antd';

import {ArrayFieldTemplateProps} from '@rjsf/core';

export const FormArrayFieldTemplate = (props: ArrayFieldTemplateProps) => {
  const {items, canAdd, onAddClick} = props;

  return (
    <div>
      {items.map(element => (
        <div key={element.key}>{element.children}</div>
      ))}
      {canAdd && <Button onClick={onAddClick}>Add Item</Button>}
    </div>
  );
};
