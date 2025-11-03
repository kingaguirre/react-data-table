
import React, { useRef } from 'react';
import styled from 'styled-components';

export default () => {
  return <DocumentationPage/>
}

//
// ——— PropDefinition & PropsDocumentation component ———
//
interface PropDefinition {
  name: string;
  type: string;
  description: string;
  defaultValue: string;
}

interface PropsDocumentationProps {
  title: string;
  props: PropDefinition[];
  linkMap: Record<string, string>;
  onLinkClick: (section: string) => void;
}

// ——— Styled Components ———
const Section = styled.section<any>`
  margin: 2rem 0;
  padding: 0 1rem;
`;
const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  letter-spacing: 1px;
`;
const TableContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  overflow-x: auto;
  box-sizing: border-box;
  * {
    box-sizing: border-box;
  }
  code {
    color: #e83e8c;
    word-break: break-word;
  }
`;
const Table = styled.div`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
`;
const Cell = styled.div`
  text-align: left;
  padding: 12px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #ddd;
`;
const HeaderCell = styled(Cell)`
  font-weight: 600;
  border: none;
`;
const PropLink = styled.button<any>`
  all: unset;
  cursor: pointer;
  font-weight: bold;
  color: inherit;
  &:after {
    content: ' ↗';
    margin-left: 0.25rem;
    font-size: 0.9em;
  }
`;
const Row = styled.div<any>`
  display: flex;
  align-items: stretch;
  justify-content: flex-start;
  > * {
    flex: 1;
    &:first-child {
      max-width: 220px;
      min-width: 220px;
    }
    &:nth-child(2) {
      min-width: 320px;
    }
    &:nth-child(3) {
      max-width: 200px;
      min-width: 200px;
    }
    &:last-child {
      max-width: 150px;
      min-width: 150px;
    }
  }
`
const Body = styled.div`
  background-color: white;
  filter: drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.10));
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: auto;
  border-top: 2px solid #ddd;
`;
const Badge = styled.code`
  display: inline-flex;
  border-radius: 2px;
  color: #666!important;
  background-color: #f3f3f3;
  padding: 2px 4px;
`
const PropsDocumentation: React.FC<PropsDocumentationProps> = ({
  title,
  props,
  linkMap,
  onLinkClick,
}) => (
  <Section id={title}>
    <Title>{title}</Title>
    <Table>
      <div>
        <Row>
          <HeaderCell>Prop Name</HeaderCell>
          <HeaderCell>Description</HeaderCell>
          <HeaderCell>Type</HeaderCell>
          <HeaderCell>Default Value</HeaderCell>
        </Row>
      </div>
      <Body>
        {props.map(({ name, description, type, defaultValue }) => (
          <Row key={name}>
             <Cell>
              {linkMap[name] ? (
                <PropLink onClick={() => onLinkClick(linkMap[name])}>
                  {name}
                </PropLink>
              ) : (
                <code>{name}</code>
              )}
            </Cell>
            <Cell>{description}</Cell>
            <Cell><Badge>{type}</Badge></Cell>
            <Cell>
              <code>{defaultValue}</code>
            </Cell>
          </Row>
        ))}
      </Body>
    </Table>
  </Section>
);

//
// ——— Data for each interface ———
//
const linkMap: Record<string, string> = {
  columnSettings: 'ColumnSettings',
  fetchConfig: 'FetchConfig',
  customRowSettings: 'CustomRowSettings',
  headerSearchSettings: 'HeaderSearchSettings',
  actionsDropdownItems: 'ActionsDropdownItems',
  actionColumnSetting: 'ActionColumnSetting',
  onDataChange: 'DataChange',
  requestData: 'RequestData',
  filterConfig: 'FilterConfig',
};

const dataTableProps: PropDefinition[] = [
  {
    name: 'dataSource',
    type: 'any[]',
    description: 'Array of objects (any shape); required to render the data table correctly.',
    defaultValue: 'Required',
  },
  {
    name: 'columnSettings',
    type: 'ColumnSettings[]',
    description: 'Configuration for each column; required. See ColumnSettings interface for available properties, including mandatory `column` and `title` fields.',
    defaultValue: 'Required',
  },
  { name: 'isDownloadDisabled', type: 'boolean', description: 'Disable download button.', defaultValue: '—' },
  { name: 'isUploadDisabled',   type: 'boolean', description: 'Disable upload button.',   defaultValue: '—' },
  { name: 'minPageSize',        type: 'number',  description: 'Minimum page size if user enters 0 or empty.', defaultValue: '10' },
  { name: 'pageSize',           type: 'number',  description: 'Rows per page; defaults to fetchConfig.requestData.pageSize or minPageSize.', defaultValue: 'Defaults to requestData.pageSize or minPageSize' },
  { name: 'pageIndex',          type: 'number',  description: 'Current page number; defaults to fetchConfig.requestData.pageNumber or 0.', defaultValue: 'Defaults to requestData.pageNumber or 0' },
  { name: 'selectable',         type: 'boolean', description: 'Show checkboxes for row selection; defaults to true if bulk delete enabled, otherwise false or as specified.', defaultValue: 'Defaults to true if isBulkDelete is true; otherwise based on selectable prop or false' },
  { name: 'multiSelect',        type: 'boolean', description: 'Allow multi-row selection; defaults to true if bulk delete enabled, otherwise based on prop.', defaultValue: 'Defaults to true if isBulkDelete is true; otherwise based on multiSelect prop or false' },
  { name: 'rowKey',             type: 'string',  description: 'Key for uniquely identifying each row.', defaultValue: '—' },
  { name: 'tableHeight',        type: 'string',  description: 'Table height as a CSS value.', defaultValue: '—' },
  { name: 'tableMaxHeight',     type: 'string',  description: 'Max table height as a CSS value.', defaultValue: '—' },
  { name: 'headerSearchSettings', type: 'HeaderSearchSettings | boolean', description: 'Main search box settings.', defaultValue: 'false' },
  { name: 'hideFooter',         type: 'boolean', description: 'Hide the table footer.', defaultValue: 'false' },
  { name: 'collapsibleRowHeight', type: 'string', description: 'Height of collapsible rows as a CSS value.', defaultValue: '—' },
  { name: 'fetchConfig',        type: 'FetchConfig', description: 'Configuration for data fetching.', defaultValue: '—' },
  { name: 'downloadXLS',        type: 'boolean', description: 'Enable downloading data as XLSX.', defaultValue: 'false' },
  { name: 'maxRowDownload',     type: 'number',  description: 'Max rows allowed to download.', defaultValue: '—' },
  { name: 'maxRowUpload',       type: 'number',  description: 'Max rows allowed to upload.', defaultValue: '—' },
  { name: 'downloadFileName',   type: 'string',  description: 'Filename to use for downloads.', defaultValue: '—' },
  { name: 'downloadHiddenColumn', type: 'boolean', description: 'Include hidden columns in download.', defaultValue: 'true' },
  { name: 'uploadXLS',          type: 'boolean', description: 'Enable uploading data as XLSX.', defaultValue: 'false' },
  { name: 'onServerSideUpload', type: '(file: any) => void', description: 'Bypass client-side upload if defined.', defaultValue: '—' },
  { name: 'activeRow',          type: 'string',  description: 'Key of the currently active row.', defaultValue: 'null' },
  { name: 'selectedRows',       type: 'any[]',   description: 'Keys of currently selected rows.', defaultValue: '[]' },
  { name: 'customRowSettings',  type: 'CustomRowSettings[]', description: 'Per-row custom styling settings.', defaultValue: '—' },
  { name: 'actions',            type: 'Actions | Actions[]', description: 'Built-in actions (ADD, EDIT, DELETE, etc.).', defaultValue: '—' },
  { name: 'actionsDropdownItems', type: 'IActionsDropdownItems[]', description: 'Extra dropdown items in the action column.', defaultValue: '—' },
  { name: 'actionsDropdownContainerWidth', type: 'string', description: 'Width of the actions dropdown container.', defaultValue: '—' },
  { name: 'isAddDisabled',      type: 'boolean', description: 'Disable the Add (+) button.', defaultValue: 'false' },
  { name: 'actionColumnSetting', type: 'IActionColumnSetting', description: 'Customize the action column header.', defaultValue: '{}' },
  { name: 'isPermanentDelete',  type: 'boolean', description: 'Permanently remove rows on Delete.', defaultValue: 'false' },
  { name: 'isBulkDelete',       type: 'boolean', description: 'Enable bulk-delete via checkboxes.', defaultValue: '—' },
  { name: 'onBulkDelete',       type: '(deletedRows: any[]) => void', description: 'Callback with rows to delete.', defaultValue: '—' },
  { name: 'selectionRange',     type: 'boolean', description: 'Enable range selection for copy/paste.', defaultValue: '—' },
  { name: 'headerRightControls', type: 'boolean', description: 'Show/hide header right controls.', defaultValue: 'false' },
  { name: 'showPreviousValue',  type: 'boolean', description: 'Show previous value tooltip on hover.', defaultValue: 'false' },
  { name: 'headerMainContent',  type: 'ReactNode', description: 'Element before the search box.', defaultValue: '—' },
  { name: 'headerLeftContent',  type: 'ReactNode', description: 'Element after the search box.', defaultValue: '—' },
  { name: 'headerRightContent', type: 'ReactNode', description: 'Element before the right icons.', defaultValue: '—' },
  { name: 'headerRightIcons',   type: '{ icon: string; onIconClick?: () => void; title?: string }[]', description: 'Extra icons in header right controls.', defaultValue: '—' },
  { name: 'isLoading',          type: 'boolean', description: 'Show loading indicator.', defaultValue: 'false' },
  { name: 'disabledPagination', type: 'boolean', description: 'Disable pagination controls.', defaultValue: 'false' },
  { name: 'isDisablePageSizeChange', type: 'boolean', description: 'Disable the page-size dropdown.', defaultValue: '—' },
  { name: 'overrideUpdateStyle', type: 'boolean', description: 'Bypass default style updates.', defaultValue: '—' },
  { name: 'totalItems',         type: 'number',  description: 'Total number of rows available (server-side).', defaultValue: '—' },
  { name: 'ssrConfig',          type: '{ fetchPageData?: (values: { pageIndex: number; pageSize: number; searchQuery?: string; filterValues?: { [key: string]: any } }) => void; onDownloadAllClick?: () => any[] \| Promise<any[]>; allData?: () => any[] \| Promise<any[]> \| any[] }', description: 'SSR pagination & download hooks.', defaultValue: '—' },
  { name: 'isSelectableDisabled', type: 'boolean', description: 'Disable row-selection checkboxes.', defaultValue: '—' },
  { name: 'localStorageSettingsKey', type: 'string', description: 'SessionStorage key for column settings.', defaultValue: '—' },
  { name: 'setActiveRowOnClick', type: 'boolean', description: 'Set active row on single click.', defaultValue: 'true' },
  { name: 'setActiveRowOnDoubleClick', type: 'boolean', description: 'Set active row on double-click.', defaultValue: 'true' },
  { name: 'withDownloadUploadAction', type: 'boolean', description: 'Show Download/Upload columns.', defaultValue: '—' },
  { name: 'undoRedoCellEditing', type: 'boolean', description: 'Enable undo/redo of full-table edits.', defaultValue: '—' },
  { name: 'undoRedoCellEditingLimit', type: 'number', description: 'Max undo/redo history.', defaultValue: '5' },
  { name: 'onChange',           type: '(updatedData: any[]) => void', description: 'Callback when table data changes.', defaultValue: '—' },
  { name: 'onRowClick',         type: '(rowData: any, index?: number) => void', description: 'Callback on row click.', defaultValue: '—' },
  { name: 'onRowDoubleClick',   type: '(rowData: any, index?: number) => void', description: 'Callback on row double-click.', defaultValue: '—' },
  { name: 'onColumnSettingsChange', type: '(newColumnSettings: ColumnSettings[]) => void', description: 'Callback on column settings change.', defaultValue: '—' },
  { name: 'onResetClick',       type: '(columnSettings: ColumnSettings[]) => void', description: 'Callback on reset icon.', defaultValue: '—' },
  { name: 'collapsibleRowRender', type: '(rowData: any) => ReactNode', description: 'Renderer for collapsible row content.', defaultValue: '—' },
  { name: 'onPageSizeChange',   type: '(newPageSize: number) => void', description: 'Callback when pageSize changes.', defaultValue: '—' },
  { name: 'onPageIndexChange',  type: '(newPageIndex: number) => void', description: 'Callback when pageIndex changes.', defaultValue: '—' },
  { name: 'onSelectedRowsChange', type: '(selectedRows: any[]) => void', description: 'Callback when selection changes.', defaultValue: '—' },
  { name: 'onDataChange',       type: '(values?: IDataChange) => void', description: 'Callback on any data update.', defaultValue: '—' },
  { name: 'onSelectionChange',  type: '(cells?: any) => void', description: 'Callback on cell-range selection.', defaultValue: '—' },
  { name: 'onRefreshIconClick', type: '() => void', description: 'Show refresh icon if defined.', defaultValue: '—' },
  { name: 'onResetIconClick',   type: '() => void', description: 'Callback on reset icon in footer.', defaultValue: '—' },
  { name: 'showReset',          type: 'boolean', description: 'Show/hide reset button in footer.', defaultValue: '—' },
];

const columnSettingsProps: PropDefinition[] = [
  { name: 'filterConfig',         type: 'IFilterConfig', description: 'Configuration for column filtering.', defaultValue: '—' },
  { name: 'column',               type: 'string',        description: 'Name of the column.',               defaultValue: '—' },
  { name: 'title',                type: 'string',        description: 'Display title of the column.',      defaultValue: '—' },
  { name: 'align',                type: `'left' | 'right' | 'center' | string`, description: 'Text alignment in the column.', defaultValue: '—' },
  { name: 'pinned',               type: 'boolean | string', description: 'Pin column to a side.',           defaultValue: '—' },
  { name: 'hidden',               type: 'boolean',       description: 'Hide the column.',                  defaultValue: '—' },
  { name: 'width',                type: 'string | number', description: 'Width as CSS value.',            defaultValue: '—' },
  { name: 'minWidth',             type: 'string | number', description: 'Minimum width as CSS value.',    defaultValue: '—' },
  { name: 'groupTitle',           type: 'string',        description: 'Title for a group of columns.',     defaultValue: '—' },
  { name: 'order',                type: 'number',        description: 'Order of the column in the table.', defaultValue: '—' },
  { name: 'sorted',               type: `'asc' | 'desc' | string`, description: 'Sorting direction.',           defaultValue: '—' },
  { name: 'draggable',            type: 'boolean',       description: 'Allow column to be dragged.',       defaultValue: '—' },
  { name: 'resizable',            type: 'boolean',       description: 'Allow column to be resized.',       defaultValue: '—' },
  { name: 'actionConfig',         type: 'any | boolean', description: 'Actions specific to this column.',  defaultValue: '—' },
  { name: 'class',                type: 'string',        description: 'CSS class for styling.',            defaultValue: '—' },
  { name: 'selectable',           type: 'boolean',       description: 'Disable selecting this column.',     defaultValue: '—' },
  { name: 'type',                 type: 'string',        description: 'Convert cell based on type.',       defaultValue: '—' },
  { name: 'columnCustomRenderer', type: '(value: any, rowData: any) => ReactNode', description: 'Custom renderer for cell content.', defaultValue: '—' },
];

const fetchConfigProps: PropDefinition[] = [
  { name: 'endpoint',             type: 'string',        description: 'URL of the API endpoint.',                        defaultValue: '—' },
  { name: 'requestData',          type: 'RequestData',   description: 'Pagination, sorting, filtering info.',            defaultValue: '—' },
  { name: 'responseDataPath',     type: 'string',        description: 'Path to items array in response JSON.',           defaultValue: '—' },
  { name: 'responseTotalDataPath',type: 'string',        description: 'Path to total count in response JSON.',           defaultValue: '—' },
  { name: 'filterSettings',       type: 'any',           description: 'Custom filter settings.',                         defaultValue: '—' },
  { name: 'callApi',              type: 'any',           description: 'Custom fetching function.',                       defaultValue: '—' },
];

const requestDataProps: PropDefinition[] = [
  { name: 'pageNumber',           type: 'number',        description: 'Page number for fetching.',                       defaultValue: '—' },
  { name: 'pageSize',             type: 'number',        description: 'Page size for fetching.',                         defaultValue: '—' },
  { name: 'sortColumn',           type: 'string',        description: 'Column name for sorting.',                        defaultValue: '—' },
  { name: 'sortDirection',        type: 'string',        description: 'Sorting direction: asc or desc.',                  defaultValue: '—' },
  { name: 'method',               type: 'string',        description: 'HTTP method for request.',                        defaultValue: '—' },
  { name: 'filter',               type: '{ [key: string]: any }', description: 'Filter criteria object.',                         defaultValue: '—' },
];

const customRowSettingsProps: PropDefinition[] = [
  { name: 'column',               type: 'string',        description: 'The column name to target.',                      defaultValue: '—' },
  { name: 'value',                type: 'string',        description: 'The cell value that triggers styling.',           defaultValue: '—' },
  { name: 'showColumn',           type: 'boolean',       description: 'Show or hide the column for this row.',           defaultValue: '—' },
  { name: 'width',                type: 'string',        description: 'CSS width for this row.',                         defaultValue: '—' },
  { name: 'styles',               type: '{ backgroundColor?: string; textDecoration?: string; color?: string; fontWeight?: string; fontStyle?: string }', description: 'CSS styles to apply.',                            defaultValue: '—' },
];

const headerSearchSettingsProps: PropDefinition[] = [
  { name: 'column',               type: 'string',        description: 'Column to filter by when searching.',             defaultValue: '—' },
  { name: 'placeholder',          type: 'string',        description: 'Placeholder text for the search box.',            defaultValue: '—' },
  { name: 'width',                type: 'string',        description: 'Width of the search box.',                        defaultValue: '—' },
];

const iActionsDropdownItemsProps: PropDefinition[] = [
  { name: 'text',                 type: 'any',           description: 'Label for the dropdown item.',                    defaultValue: '—' },
  { name: 'icon',                 type: 'string',        description: 'Icon identifier to display.',                     defaultValue: '—' },
  { name: 'disabled',             type: 'boolean',       description: 'Disable this dropdown item.',                     defaultValue: '—' },
  { name: 'onClick',              type: '(data?: any) => void', description: 'Click handler for this item.',                 defaultValue: '—' },
];

const iActionColumnSettingProps: PropDefinition[] = [
  { name: 'width',                type: 'string',        description: 'Width of the action column header.',              defaultValue: '—' },
  { name: 'title',                type: 'string',        description: 'Title text for the action column.',               defaultValue: '—' },
];

const iDataChangeProps: PropDefinition[] = [
  { name: 'data',                 type: 'any',           description: 'Updated table data array.',                       defaultValue: '—' },
  { name: 'filteredData',         type: 'any',           description: 'Filtered data array.',                            defaultValue: '—' },
  { name: 'totalData',            type: 'number',        description: 'Total count of data items.',                      defaultValue: '—' },
  { name: 'pageIndex',            type: 'number',        description: 'Footer page index.',                              defaultValue: '—' },
  { name: 'internalPageIndex',    type: 'number',        description: 'Internal page index.',                            defaultValue: '—' },
  { name: 'pageSize',             type: 'number',        description: 'Footer page size.',                               defaultValue: '—' },
  { name: 'selectedRows',         type: 'any[]',         description: 'Keys of selected rows.',                          defaultValue: '—' },
];

const iFilterConfigProps: PropDefinition[] = [
  { name: 'type',                 type: 'string',        description: 'Type of filter (text, CODE_DECODE_DROPDOWN, dropdown, number-range, date-range).',              defaultValue: '—' },
  { name: 'value',                type: 'any',           description: 'Current filter value.',                           defaultValue: '—' },
  { name: 'multiSelect',          type: 'boolean',       description: 'Allow multi-select values. (CODE_DECODE_DROPDOWN, dropdown)',                      defaultValue: '—' },
  { name: 'options',              type: 'IOptions[]',    description: 'Dropdown options list. (dropdown)',                          defaultValue: '—' },
  { name: 'codeId',               type: 'string',        description: 'Field used as option value. (CODE_DECODE_DROPDOWN)',                     defaultValue: '—' },
  { name: 'placeholder',          type: 'string',        description: 'Placeholder for filter input.',                   defaultValue: '—' },
];

const columnSettingsInterfaces: { title: string; props: PropDefinition[] }[] = [
  { title: 'DataTable Props',       props: dataTableProps },
  { title: 'ColumnSettings',       props: columnSettingsProps },
  { title: 'FetchConfig',          props: fetchConfigProps },
  { title: 'RequestData',          props: requestDataProps },
  { title: 'CustomRowSettings',    props: customRowSettingsProps },
  { title: 'HeaderSearchSettings', props: headerSearchSettingsProps },
  { title: 'ActionsDropdownItems', props: iActionsDropdownItemsProps },
  { title: 'ActionColumnSetting', props: iActionColumnSettingProps },
  { title: 'DataChange',          props: iDataChangeProps },
  { title: 'FilterConfig',        props: iFilterConfigProps },
];

//
// ——— Top-level DocumentationPage — renders all tables & handles scroll ———
//
export const DocumentationPage: React.FC = () => {
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleLinkClick = (section: string) => {
    const el = sectionRefs.current[section];
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <TableContainer>
      {columnSettingsInterfaces.map(({ title, props }) => (
        <div
          key={title}
          ref={el => { sectionRefs.current[title] = el; }}
        >
          <PropsDocumentation
            title={title}
            props={props}
            linkMap={linkMap}
            onLinkClick={handleLinkClick}
          />
        </div>
      ))}
    </TableContainer>
  );
};