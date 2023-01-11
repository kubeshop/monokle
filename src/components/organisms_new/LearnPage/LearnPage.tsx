import {CheckOutlined, UnorderedListOutlined} from '@ant-design/icons';

import {Icon} from '@monokle/components';

import HelpfulResourceCard from './HelpfulResourceCard';
import LearnCard from './LearnCard';
import * as S from './LearnPage.styled';

const LearnPage: React.FC = () => {
  return (
    <S.LearnPageContainer>
      <S.Description>
        Select in which stage of the K8s manifests management you are in (or from which one you want to learn more
        about) and let us show you how Monokle can help you.
      </S.Description>

      <S.LearnCardsContainer>
        <LearnCard
          buttonText="Your workspace"
          description="Configure your resources workspace, whereas it's local, on a Git, a cluster or from scratch."
          icon={<UnorderedListOutlined />}
          title="Explore"
          onClick={() => {}}
        />

        <LearnCard
          buttonText="Edit & fix"
          description="Fix errors in your resources, compare them, learn about yaml best practices and much more."
          icon={<Icon name="terminal" style={{fontSize: '16px'}} />}
          title="Edit"
          onClick={() => {}}
        />

        <LearnCard
          buttonText="Validate"
          description="Configure your policies & validation rules, create your own. See & fix validation errors."
          icon={<CheckOutlined />}
          title="Validate"
          onClick={() => {}}
        />

        <LearnCard
          buttonText="Publish & Git"
          description="Save locally, get into Git (Github, Gitlab), create PRs, deploy to a cluster..."
          icon={<S.CloudUploadOutlined />}
          title="Publish"
          onClick={() => {}}
        />
      </S.LearnCardsContainer>

      <S.SubTitle>Helpful resources</S.SubTitle>

      <S.HelpfulResourcesContainer>
        <HelpfulResourceCard description="A quick read" title="Start Guide" />
        <HelpfulResourceCard description="To learn the basics" title="3-minute Video Tutorial" />
        <HelpfulResourceCard description="in Confluence" title="Documentation" />
        <HelpfulResourceCard description="Join the conversation" title="Discord" />
        <HelpfulResourceCard description="in the latest version?" title="What's new" />
        <HelpfulResourceCard description="Share your thoughts" title="Feedback" />
      </S.HelpfulResourcesContainer>
    </S.LearnPageContainer>
  );
};

export default LearnPage;
