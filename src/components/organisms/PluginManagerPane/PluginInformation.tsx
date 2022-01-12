import React from 'react';

import {AnyPlugin} from '@models/plugin';

function PluginInformation(props: {plugin: AnyPlugin}) {
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
