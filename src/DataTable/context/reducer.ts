import { ColumnSettings } from "../interfaces";
import {
  SET_SEARCH,
  SET_TABLE_WIDTH,
  SET_LOCAL_PAGE_INDEX,
  SET_LOCAL_PAGE_SIZE,
  SET_COLUMNS,
  SET_ACTIVE_ROW,
  SET_SELECTED_ROWS,
  SET_FILTER_VALUES,
  SET_FETCHED_DATA,
  SET_ADVANCE_FILTER_VALUES,
} from "./actions";

interface IFetchedData {
  data: any[] | null | undefined;
  totalData: number;
  fetching: boolean;
}
export interface IReducerState {
  search?: string | undefined;
  tableWidth: number | null;
  localPageIndex: number | null;
  localPageSize: number | null;
  columns: ColumnSettings[];
  activeRow: string | null;
  selectedRows: string[];
  filterValues: any;
  advanceFilterValues: any;
  fetchedData?: IFetchedData
}

interface IAction {
  type: string;
  payload: any;
}

export const initialState: IReducerState = {
  search: undefined,
  tableWidth: null,
  localPageIndex: null,
  localPageSize: null,
  columns: [],
  activeRow: null,
  selectedRows: [],
  filterValues: {},
  advanceFilterValues: {},
  fetchedData: { data: undefined, totalData: 0, fetching: false },
}
const dataTableReducer = (state: IReducerState, action: IAction) => {
  switch (action.type) {
    case SET_SEARCH:
      return { ...state, search: action.payload };
    case SET_TABLE_WIDTH:
      return { ...state, tableWidth: action.payload };
    case SET_LOCAL_PAGE_INDEX:
      return { ...state, localPageIndex: action.payload };
    case SET_LOCAL_PAGE_SIZE:
      return { ...state, localPageSize: action.payload };
    case SET_COLUMNS:
      return { ...state, columns: action.payload };
    case SET_ACTIVE_ROW:
      return { ...state, activeRow: action.payload };
    case SET_SELECTED_ROWS:
      return { ...state, selectedRows: action.payload };
    case SET_FILTER_VALUES:
      return { ...state, filterValues: action.payload };
    case SET_ADVANCE_FILTER_VALUES:
      return { ...state, advanceFilterValues: action.payload };
    case SET_FETCHED_DATA:
      return { ...state, fetchedData: action.payload };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

export default dataTableReducer;