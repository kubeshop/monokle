import React from 'react';

import {Button} from 'antd';

const data = {
  description: 'Scan your code for vulnerabilities. Enable or disable Trivy rules in this list.',
};

type Props = {
  onBack: () => void;
};

export function ValidationOpenPolicyAgent({onBack}: Props) {
  return (
    <>
      <div>
        <p>Open Policy Agent</p>
        <Button onClick={onBack}>Back</Button>
      </div>

      <div>
        <p>{data.description}</p>
        <Button>Enable all</Button>
        <Button>Disable all</Button>
      </div>
    </>
  );
}
