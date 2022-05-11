import React, {useMemo, useState} from 'react';

import {Button} from 'antd';
import 'antd/dist/antd.dark.css';

import {times} from 'lodash';

import faker from '@faker-js/faker';

import DiffModal from './CompareModal';
import {FakeMainState} from './CompareState';
import {basicDeploymentFixture} from './__test__/fixtures/basicDeployment';
import {compareStateFixture} from './__test__/fixtures/compareState';
import {Mockstore} from './__test__/utils/mockStore';

export function Default({scenario}: {scenario: string}) {
  const currentScenario = useMemo(() => SCENARIOS[scenario], [scenario]);
  const [visible, setVisible] = useState<boolean>(true);

  const showModal = () => {
    setVisible(true);
  };

  return (
    <Mockstore mainState={currentScenario}>
      <Button type="primary" onClick={showModal}>
        Open Modal
      </Button>
      <DiffModal visible={visible} onClose={() => setVisible(false)} />
    </Mockstore>
  );
}

const SCENARIOS: Record<string, Partial<FakeMainState>> = {
  empty: compareStateFixture(),
  left: compareStateFixture({
    diff: {
      current: {
        view: {
          leftSet: {
            type: 'local',
          },
        },
        left: {
          loading: false,
          error: false,
          resources: times(50, () => basicDeploymentFixture()),
        },
      },
    },
  }),
  comparison: compareStateFixture({
    diff: {
      current: {
        view: {
          operation: 'union',
          leftSet: {
            type: 'local',
          },
          rightSet: {
            type: 'cluster',
          },
        },
        left: {
          loading: false,
          error: false,
          resources: times(20, () => basicDeploymentFixture()),
        },
        right: {
          loading: false,
          error: false,
          resources: times(20, () => basicDeploymentFixture()),
        },
        diff: {
          loading: false,
          comparisons: [
            {
              id: faker.datatype.uuid(),
              isMatch: true,
              left: basicDeploymentFixture(),
              right: basicDeploymentFixture(), // not actually a match but it suffices..
              isDifferent: true,
            },
            {
              id: faker.datatype.uuid(),
              isMatch: true,
              left: basicDeploymentFixture(),
              right: basicDeploymentFixture(), // not actually a match but it suffices..
              isDifferent: false,
            },
            {id: faker.datatype.uuid(), isMatch: false, left: basicDeploymentFixture(), right: undefined},
            {id: faker.datatype.uuid(), isMatch: false, left: undefined, right: basicDeploymentFixture()},
          ],
        },
      },
    },
  }),
};

Default.args = {};
Default.argTypes = {
  scenario: {
    control: {type: 'select'},
    options: Object.keys(SCENARIOS),
    defaultValue: 'comparison',
  },
};
