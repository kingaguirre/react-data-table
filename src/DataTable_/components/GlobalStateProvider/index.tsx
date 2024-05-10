import * as React from "react";
import { IGLobalStateProvider, IWithState, IComponent } from './interface';

const GlobalStateContext = React.createContext<any>(undefined);

export const GlobalStateProvider = (props: IGLobalStateProvider) => {
  const { children, values } = props;
  const [state, dispatch] = React.useReducer(
    (state, newValue) => ({ ...state, ...newValue }),
    values
  );

  // Use useEffect to watch for changes in globalState prop and update state
  React.useEffect(() => {
    dispatch(values);
  }, [values]);

  const getContextValue = (state) => {
    const allProps = {...state};
    delete allProps.globalState;
    delete allProps.setGlobalState;

    return {
      ...allProps,
      ...state.globalState,
      setGlobalState: state.setGlobalState
    }
  }

  return (
    <GlobalStateContext.Provider value={getContextValue(state)}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const withState = (props: IWithState) => (Component) => (moreProps: any) => {
  const { states } = props;
  const globalState = React.useContext(GlobalStateContext);

  const setGlobalStateByKey = React.useCallback((stateKey: string, value: any) => globalState?.setGlobalState((prev) => ({
    ...prev,
    [stateKey]: value
  })), []);

  const setGlobalStateByObj = React.useCallback((newValue: {[key: string]: any}) => 
    globalState?.setGlobalState(prev => ({ ...prev, ...newValue })), []);

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
    ...extractedState,
    setGlobalState: globalState?.setGlobalState,
    setGlobalStateByKey,
    setGlobalStateByObj
  }
  return <Component {...allProps}/>
};

export * from './interface';
