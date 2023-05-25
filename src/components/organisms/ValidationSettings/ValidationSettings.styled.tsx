import styled from 'styled-components';

import {PrimaryButton} from '@atoms';

import {Colors} from '@shared/styles/colors';
import {Device} from '@shared/styles/device';

export const ValidationSettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

export const ValidationSettingsDescription = styled.div`
  font-size: 14px;
  font-weight: 100;
  color: ${Colors.whitePure};
`;

export const CheckoutErrorsButton = styled(PrimaryButton)`
  font-weight: 400;
  align-self: center;
  height: 40px;
  width: auto;
  margin-left: 4%;
`;

export const ValidationSettingsDescriptionAndButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;

  @media ${Device.laptopS} {
    width: 50%;
    margin-left: 25%;
  }
`;

export const Link = styled.a`
  color: ${Colors.blue7};
  margin-left: 5px;
`;
