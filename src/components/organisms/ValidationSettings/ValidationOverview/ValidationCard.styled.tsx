import {Button as RawButton, Switch as RawSwitch} from 'antd';

import styled from 'styled-components';

import {PrimaryButton} from '@atoms';

import {Icon as BaseIcon} from '@monokle/components';
import {Colors} from '@shared/styles/colors';
import {Device} from '@shared/styles/device';

export const Button = styled(RawButton)`
  align-self: center;
`;

export const ConfigureButton = styled(PrimaryButton)`
  font-weight: 400;
  align-self: center;
`;

export const Description = styled.span`
  color: ${Colors.grey8};
`;

export const Icon = styled(BaseIcon)`
  font-size: 32px;
`;

export const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const Link = styled.a`
  color: ${Colors.blue7};
  margin-left: 5px;
`;

export const Name = styled.div`
  color: ${Colors.whitePure};
  font-weight: 700;
`;

export const Switch = styled(RawSwitch)`
  position: absolute;
  top: 15px;
  right: 20px;
`;

export const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ValidationCardContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  padding: 20px 45px 20px 20px;
  position: relative;
  display: grid;
  grid-template-columns: max-content 1fr max-content;
  grid-column-gap: 25px;
  height: 145px;
  width: 100%;

  /* @media ${Device.laptopS} {
    width: 50%;
    margin-left: 25%;
  } */
`;
