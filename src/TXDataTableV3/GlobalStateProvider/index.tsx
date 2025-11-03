import React from "react";
import { IGLobalStateProvider, IWithState, IComponent } from './interfaces';

/** 
 * React Context api have an issue in re-rendering all child componenents 
 * even some child doesnt changes its props.
 * This Component-Contenxt-Provider solves that issue and avoid re-rendering of each
 * child component by using 'withState', using this correctly avoids unnecessary re-rendering
 * and improves component performance 
 */
const GlobalStateContext = React.createContext<any>(undefined);

export const GlobalStateProvider = (props: IGLobalStateProvider) => {
  const { children, values } = props;
  const [state, dispatch] = React.useReducer(
    (state, newValue) => ({ ...state, ...newValue }),
    values
  );

  const mountedRef = React.useRef(false);

  // Use useEffect to watch for changes in globalState prop and update state
  React.useEffect(() => {
    mountedRef.current = true;
    if (mountedRef.current) {
      dispatch(values);
    }
    
    return () => {
      mountedRef.current = false;
    }
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

/** Use to check re-renderin components */
export const useFlasher: any = () => {
  const ref: any = React.useRef();
  React.useEffect(() => {
    const isDataTable = window.location.href?.includes('txdatatablev3');
    if (isDataTable) {
      const cur: any = ref.current;
      if (cur) {
        cur?.setAttribute(
          "style",
          `box-shadow: 0 0 8px 1px #d81b60;
          background-color: #fce4ec;
          transition: box-shadow 50ms ease-out;`
        )
      }
      setTimeout(() => {
        if (cur) {
          cur?.setAttribute("style", "");
        }
      }, 100);
    }
  });
  return ref;
};

export * from './interfaces';