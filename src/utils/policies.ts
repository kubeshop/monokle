import {loadBinaryResource} from '@redux/services';

import {loadPolicy} from '@open-policy-agent/opa-wasm';

type LoadedPolicy = Awaited<ReturnType<typeof loadPolicy>>;
let CACHED_POLICY: LoadedPolicy | undefined;

type Misconfiguration = {
  msg: string;
  severity: string;
  title: string;
  type: string;
  id: string;
};

type EvaluateOutput = Array<{
  result: Misconfiguration[];
}>;

export function validatePolicies(resourceContent: any): Misconfiguration[] {
  if (!CACHED_POLICY) {
    console.error('policy not loaded yet');
    return [];
  }

  const output: EvaluateOutput | null = CACHED_POLICY.evaluate(resourceContent);
  // console.log('policy evaluated', JSON.stringify(output, null, 2));

  if (!output || output.length === 0) {
    console.error('evaluation failed');
    return [];
  }

  return output[0].result;
}

async function lazyLoadPolicy() {
  if (CACHED_POLICY) {
    return CACHED_POLICY;
  }

  const policyWasm = loadBinaryResource('policies/cpu_not_limited.wasm');

  if (!policyWasm) {
    throw new Error('policy file not found');
  }

  try {
    CACHED_POLICY = await loadPolicy(policyWasm);
  } catch (err) {
    console.error('policy load failed', err);
    throw new Error('policy load failed');
  }

  return CACHED_POLICY;
}

lazyLoadPolicy()
  .then(policy => console.log('policy loaded'))
  .catch(err => console.error('policed load failed')); // yikes
