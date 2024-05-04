import * as React from "react";
import { IGLobalStateProvider, IWithState, IComponent } from './interface';

const GlobalStateContext = React.createContext<any>(undefined);
// const DispatchStateContext = React.createContext<any>(undefined);

export const GlobalStateProvider = (props: IGLobalStateProvider) => {
  const { children, globalState } = props;
  const [state, dispatch] = React.useReducer(
    (state, newValue) => ({ ...state, ...newValue }),
    globalState
  );

  // Use useEffect to watch for changes in globalState prop and update state
  React.useEffect(() => {
    dispatch(globalState);
  }, [globalState]);

  return (
    <GlobalStateContext.Provider value={state}>
      {/* <DispatchStateContext.Provider value={dispatch}> */}
        {children}
      {/* </DispatchStateContext.Provider> */}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => [
  React.useContext(GlobalStateContext),
  // React.useContext(DispatchStateContext)
];

// const isObject = (value) => value !== null && (typeof value === 'object' || typeof value === 'function');
export const withState = (props: IWithState) => (Component) => (moreProps: any) => {
  const { states } = props;
  const [ globalState ] = useGlobalState();

  // const setState = React.useCallback((value: any, stateKey: string) => setGlobalState({
  //   [stateKey]: isObject(value) ? { ...globalState?.[stateKey], ...value} : value
  // }), []);

  const extractedState = React.useMemo(() => {
    if (!states) return {};
    if (typeof states === 'string') {
      return { [states]: globalState?.[states] };
    } else {
      return states.reduce((acc, stateKey) => {
        acc[stateKey] = globalState?.[stateKey];
        return acc;
      }, {});
    }
  }, [states, globalState]);

  const allProps: IComponent = {
    ...moreProps,
    // setState,
    ...extractedState
  }
  return <Component {...allProps}/>
};

export * from './interface';
