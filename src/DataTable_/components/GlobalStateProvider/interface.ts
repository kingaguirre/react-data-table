export interface IGlobalState {
  [key: string]: any
}
export interface IGLobalStateProvider {
  children?: React.ReactNode;
  globalState?: IGlobalState;
}
export interface IWithState {
  states?: string | string[];
}
export interface IComponent {
  setState?: (value: any, stateKey: string) => void;
  states?: any;
  [key: string]: any;
};