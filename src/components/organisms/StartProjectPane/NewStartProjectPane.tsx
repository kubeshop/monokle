import {Button} from 'antd';

import styled from 'styled-components';

import CreateFromTemplate from '@assets/CreateFromTemplate.svg';
import CreateScratch from '@assets/CreateScratch.svg';
import SelectFolder from '@assets/SelectFolder.svg';

import Colors from '@styles/Colors';

import Guide from './Guide';

const Container = styled.div`
  grid-column: 1 / -1;
`;

const InformationMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin 7.5rem 0 6.5rem 0;
  font-size: 16px;
  color: ${Colors.grey7};
  font-weight: 600;
`;

const StartProjectContainer = styled.div`
  display: flex;
  justify-content: space-between;
  alig-items: center;
  width: 100%;
  padding: 0 6rem;
`;

const StartProjectItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 1.5rem;
  :first-child {
    margin: 0 1.5rem 0 0;
  }
  :last-child {
    margin: 0 0 0 1.5rem;
  }
`;

const StartProjectItemLogo = styled.img`
  width: 10rem;
  height: 10rem;
`;

const StartProjectItemTitle = styled.div`
  margin-top: 1.5rem;
  font-size: 20px;
  color: ${Colors.whitePure};
  font-weight: 600;
  text-align: center;
  width: 100%;
`;

const StartProjectItemDescription = styled.div`
  margin-top: 1rem;
  font-size: 14px;
  color: ${Colors.whitePure};
  font-weight: 400;
  text-align: center;
  width: 100%;
`;

const StartProjectItemButton = styled(Button)`
  background: ${Colors.blue7};
  color: ${Colors.whitePure};
  margin-top: 1.5rem;
  border: 1px solid ${Colors.blue6};
  font-weight: 400;
  box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.043);
  border-radius: 2px;

  :hover,
  :active,
  :focus {
    background: ${Colors.blue7}CC;
    color: ${Colors.whitePure};
  }
`;

const NewStartProjectPane = () => {
  return (
    <Container>
      <Guide />
      <InformationMessage>Choose your way to start your first project:</InformationMessage>
      <StartProjectContainer>
        <StartProjectItem>
          <StartProjectItemLogo src={SelectFolder} />
          <StartProjectItemTitle>Select a folder with K8s resources</StartProjectItemTitle>
          <StartProjectItemDescription>
            Already have a local folder with ready-to-check Kubernetes resources? Bring it on!
          </StartProjectItemDescription>
          <StartProjectItemButton>Open</StartProjectItemButton>
        </StartProjectItem>
        <StartProjectItem>
          <StartProjectItemLogo src={CreateScratch} />
          <StartProjectItemTitle>Create a project from scratch</StartProjectItemTitle>
          <StartProjectItemDescription>
            Create an empty project and new resources from scratch. We’ll help you along the way.
          </StartProjectItemDescription>
          <StartProjectItemButton>Create</StartProjectItemButton>
        </StartProjectItem>
        <StartProjectItem>
          <StartProjectItemLogo src={CreateFromTemplate} />
          <StartProjectItemTitle>Start from a template</StartProjectItemTitle>
          <StartProjectItemDescription>
            Create basic jobs, pods, roles, services and other resources through ready-to-go templates.
          </StartProjectItemDescription>
          <StartProjectItemButton>Select Template</StartProjectItemButton>
        </StartProjectItem>
      </StartProjectContainer>
    </Container>
  );
};

export default NewStartProjectPane;
