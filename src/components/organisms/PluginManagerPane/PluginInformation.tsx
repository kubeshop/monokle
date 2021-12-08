import React from 'react';

import {MonoklePlugin} from '@models/plugin';

function PluginInformation(props: {plugin: MonoklePlugin}) {
  const {plugin} = props;
  return (
    <div>
      <p>
        {plugin.name} - {plugin.version}
      </p>
    </div>
  );
}

export default PluginInformation;
