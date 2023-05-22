import styled from 'styled-components';
import {PrimaryButton} from '@atoms';

import {Colors} from '@shared/styles/colors';

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
  margin-left: 2%;
`;

export const ValidationSettingsDescriptionAndButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-left: 25%;
  width: 50%;
  margin-bottom: 10px;
`;

export const Link = styled.a`
  color: ${Colors.blue7};
  margin-left: 5px;
`;
