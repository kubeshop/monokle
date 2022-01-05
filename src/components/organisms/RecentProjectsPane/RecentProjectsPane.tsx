import React from 'react';

import {Row} from 'antd';

import styled from 'styled-components';

import {MonoPaneTitle, MonoPaneTitleCol} from '@atoms';

const TitleBarContainer = styled.div`
  display: flex;
  height: 24px;
  justify-content: space-between;
`;

const Title = styled.span`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  padding-right: 10px;
`;

const RecentProjectsPane = () => {
  return (
    <div>
      <Row>
        <MonoPaneTitleCol>
          <MonoPaneTitle>
            <TitleBarContainer>
              <Title>Recent Projects</Title>
            </TitleBarContainer>
          </MonoPaneTitle>
        </MonoPaneTitleCol>
      </Row>
    </div>
  );
};

export default RecentProjectsPane;
