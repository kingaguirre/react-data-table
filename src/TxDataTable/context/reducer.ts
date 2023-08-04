import { ColumnSettings } from "../interfaces";
import {
  SET_SEARCH,
  SET_PARENT_WIDTH,
  SET_LOCAL_PAGE_INDEX,
  SET_LOCAL_PAGE_SIZE,
  SET_COLUMNS,
  SET_ACTIVE_ROW,
  SET_SELECTED_ROWS,
  SET_FILTER_VALUES,
  SET_FETCHED_DATA,
} from "./actions";

interface IFetchedData {
  data: any[];
  totalData: number
}
export interface IReducerState {
  search: string;
  parentWidth: number | null;
  localPageIndex: number | null;
  localPageSize: number | null;
  columns: ColumnSettings[];
  activeRow: string | null;
  selectedRows: string[];
  filterValues: any;
  fetchedData?: IFetchedData
}

interface IAction {
  type: string;
  payload: any;
}

export const initialState: IReducerState = {
  search: "",
  parentWidth: null,
  localPageIndex: null,
  localPageSize: null,
  columns: [],
  activeRow: null,
  selectedRows: [],
  filterValues: {},
  fetchedData: { data: [], totalData: 0 },
}
const dataTableReducer = (state: IReducerState, action: IAction) => {
  switch (action.type) {
    case SET_SEARCH:
      return { ...state, search: action.payload };
    case SET_PARENT_WIDTH:
      return { ...state, parentWidth: action.payload };
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
    case SET_FETCHED_DATA:
      return { ...state, fetchedData: action.payload };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

export default dataTableReducer;