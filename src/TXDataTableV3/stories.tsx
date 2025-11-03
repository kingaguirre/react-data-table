import React from 'react';
import { TXDataTable } from './index';

/** Stories */
import DefaultStories from './stories/default';
import DocsStories from './stories/docs';
import ValidationsStories from './stories/validations';
import ActionsStories from './stories/actions';
import BulkDeleteStories from './stories/bulk-delete';
import DownloadStories from './stories/download';
import DownloadHiddenColumnStories from './stories/download-with-hidden-column';
import ColumnFilterStories from './stories/columnFilter';
import CopyPasteExcelStories from './stories/copyPasteExcel';
import FullDemoStories from './stories/fullDemo';
import EditableColumnTypesStories from './stories/editable-column-types';
import RxamplesStories from './stories/examples';
import ServerSideRenderingStories from './stories/server-side-rendering';
import OrganismStories from './stories/organism';

export default {
  component: TXDataTable,
  argTypes: {},
};

export const Docs = () => <DocsStories/>

export const Default = () => <DefaultStories/>

export const Validations = () => <ValidationsStories/>

export const Actions = () => <ActionsStories/>

export const BulkDelete = () => <BulkDeleteStories/>

export const DownloadUploadExcel = () => <DownloadStories/>

export const DownloadHiddenColumn = () => <DownloadHiddenColumnStories/>

export const CopyPasteToExcelAndViceVersa = () => <CopyPasteExcelStories/>

export const ColumnFilters = () => <ColumnFilterStories/>

export const EditableColumnTypes = () => <EditableColumnTypesStories/>

export const FullDemo = () => <FullDemoStories/>

export const Examples = () => <RxamplesStories/>

export const ServerSideRendering = () => <ServerSideRenderingStories/>

export const Organism = () => <OrganismStories/>