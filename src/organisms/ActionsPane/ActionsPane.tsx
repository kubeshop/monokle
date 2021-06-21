import * as React from 'react';
import {
  Button,
  Col, Container, Row, Tab, Tabs,
} from 'react-bootstrap';
import { debugBorder } from '../../styles/DebugStyles';
import Monaco from '../../molecules/Monaco';
import FormEditor from '../../molecules/FormEditor';
import GraphView from '../../molecules/GraphView';
import { useAppSelector } from '../../redux/hooks';
import log from 'loglevel';
import { stringify } from 'yaml';
import { spawn } from 'child_process';
import path from 'path';
import { K8sResource } from '../../models/k8sresource';
import { isKustomizationResource } from '../../redux/utils/resource';

function applyResource(resource: K8sResource) {
  const child = spawn('kubectl', ['apply', '-f', '-']);
  child.stdin.write(stringify(resource.content));
  child.stdin.end();
  return child;
}

function applyKustomization(resource: K8sResource) {
  const folder = resource.path.substr(0, resource.path.lastIndexOf(path.sep));
  const child = spawn('kubectl', ['apply', '-k', folder]);
  return child;
}

const ActionsPane = () => {
  const selectedResource = useAppSelector(state => state.main.selectedResource);
  const resourceMap = useAppSelector(state => state.main.resourceMap);

  async function applySelectedResource() {
    if (selectedResource) {
      try {
        const resource = resourceMap[selectedResource];
        if (resource && resource.content) {
          const child = isKustomizationResource(resource) ? applyKustomization(resource) : applyResource(resource);

          child.on('exit', function(code, signal) {
            log.info(`kubectl exited with code ${code} and signal ${signal}`);
          });

          child.stdout.on('data', (data) => {
            log.info(`child stdout:\n${data}`);
          });

          child.stderr.on('data', (data) => {
            log.error(`child stderr:\n${data}`);
          });
        }
      } catch (e) {
        log.error('Failed to apply resource');
        log.error(e);
      }
    }
  }

  return (
    <Container>
      <Row style={debugBorder}>
        <h4>Editors/Actions</h4>
      </Row>
      <Row>
        <Button variant='outline-dark' size='sm' onClick={applySelectedResource}
                disabled={selectedResource === undefined}>Apply</Button>
      </Row>
      <Row style={debugBorder}>
        <Col>
          <Tabs defaultActiveKey='source' id='uncontrolled-tab-example'>
            <Tab eventKey='source' title='Source'>
              <Monaco />
            </Tab>
            <Tab eventKey='form' title='Form'>
              <FormEditor />
            </Tab>
            <Tab eventKey='graph' title='Graph'>
              <GraphView />
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default ActionsPane;
