export interface IGLobalStateProvider {
  children?: React.ReactNode;
  values?: {
    [key: string]: any;
    globalState: any;
    setGlobalState: (value: any) => void;
  };
}
export interface IWithState {
  states?: string | string[];
  setGlobalState?: (value: any) => void
}
export interface IComponent {
  setState?: (value: any, stateKey: string) => void;
  states?: any;
  [key: string]: any;
};