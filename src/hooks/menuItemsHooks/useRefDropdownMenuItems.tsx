// import {useMemo} from 'react';
// import {Menu, MenuProps, Tag} from 'antd';
// import styled from 'styled-components';
// import {useAppDispatch} from '@redux/hooks';
// import {selectResource} from '@redux/reducers/main';
import {Menu} from 'antd';

import styled from 'styled-components';

// import {Warning} from '@components/organisms/NavigatorPane/WarningsAndErrorsDisplay';
import {Icon as RawIcon} from '@monokle/components';
import {Colors} from '@shared/styles/colors';

// TODO: reimplement this after integrating @monokle/validation
// the Warning model needs a `resourceIdentifier` field or at least resourceId and resourceStorage fields
export function useRefDropdownMenuItems(type: 'error' | 'warning') {
  // const dispatch = useAppDispatch();
  // const items: MenuProps['items'] = useMemo(
  //   () =>
  //     warnings.map(warning => ({
  //       key: warning.id,
  //       label: (
  //         <MenuItem key={warning.id} onClick={() => dispatch(selectResource({resourceId: warning.id}))}>
  //           {warning.namespace && <Tag>{warning.namespace}</Tag>}
  //           <span>{warning.name}</span>
  //           <WarningCountContainer $type={type}>
  //             <Icon $type={type} name={type} /> {warning.count}
  //           </WarningCountContainer>
  //           <WarningKindLabel>{warning.type}</WarningKindLabel>
  //         </MenuItem>
  //       ),
  //     })),
  //   [dispatch, type, warnings]
  // );
  // return items;
}

// Styled Components

const Icon = styled(RawIcon)<{$type: 'warning' | 'error'}>`
  ${({$type}) => {
    if ($type === 'error') {
      return `
      transform: translateY(-1.5px);
    `;
    }
  }}
`;

const MenuItem = styled(Menu.Item)`
  margin-bottom: 0 !important;
  margin-top: 0 !important;
  height: 28px !important;
  line-height: 28px !important;
  padding: 0;
  background-color: transparent !important;
`;

const WarningCountContainer = styled.span<{$type: 'warning' | 'error'}>`
  ${({$type}) => `color: ${$type === 'warning' ? Colors.yellowWarning : Colors.redError};`}
  margin-left: 8px;
  cursor: pointer;
`;

const WarningKindLabel = styled.span`
  margin-left: 8px;
  font-style: italic;
  color: ${Colors.grey7};
`;
