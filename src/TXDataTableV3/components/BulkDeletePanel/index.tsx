import React from "react";
import { TxCoreButton, TxCoreIcon } from 'tradeport-web-components/dist/react';
import { TXConfirmModal } from '@atoms/TXConfirmModal';
import { Wrapper, Container, SelectedItems, IconContainer } from "./styled";
import { withState, IComponent } from '../../GlobalStateProvider';
import { updateDataSource } from './utils';

export const BulkDeletePanel = withState({
  states: [
    'isBulkDelete',
    'onBulkDelete',
    'selectedRows',
    'rowKey',
    'isPermanentDelete',
    'localData',
    'ssrConfig'
  ],
})(React.memo((props: IComponent) => {
  const {
    isBulkDelete,
    onBulkDelete,
    selectedRows,
    rowKey,
    isPermanentDelete,
    localData,
    ssrConfig,
    setGlobalStateByKey
  } = props;

  const [modalSettings, setModalSettings] = React.useState<any>({
    show: false,
    bodyContent: null,
    buttons: [],
    title: '',
    variation: '',
    icon: '',
  });

  const hasSelectedRows = selectedRows?.length > 0;
  const itemSufix = selectedRows?.length > 1 ? 's' : '';

  const handleOnBulkDelete = () => {
    setModalSettings({
      title: 'Confirm',
      variation: 'danger',
      icon: 'alert',
      show: true,
      bodyContent: <div>Are you sure you want to delete {selectedRows.length} record{itemSufix}?</div>,
      buttons: [{
        size: "small",
        onButtonClick: () => {
          onBulkDelete?.(selectedRows);
          setModalSettings((prev) => ({...prev, show: false}));
          if (!ssrConfig) {
            setGlobalStateByKey('localData', updateDataSource(localData, selectedRows, rowKey, isPermanentDelete))
          }
          setGlobalStateByKey('selectedRows', []);
        },
        text: "Yes",
        variation: 'danger'
      }]
    });
  }

  return !!isBulkDelete ? (
    <Wrapper show={hasSelectedRows} data-testid='buld-delete-panel'>
      <Container>
        <SelectedItems>
          <IconContainer>
            <TxCoreIcon icon="check"/>
            <TxCoreIcon icon="check"/>
          </IconContainer>
          <b>{selectedRows.length}</b> Selected item{itemSufix}
        </SelectedItems>
        <TxCoreButton
          variation="danger"
          size="sm"
          disabled={!hasSelectedRows}
          onButtonClick={handleOnBulkDelete}
        >Delete</TxCoreButton>
      </Container>
      <TXConfirmModal
          {...modalSettings}
          onClose={() => setModalSettings(prev => ({...prev, show: false}))}
        />
    </Wrapper>
  ) : null;
}));
